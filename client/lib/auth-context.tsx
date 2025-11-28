import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient } from './api/core/client';
import { queryClient } from '../App';

// =================== TYPES ===================

export type UserRole = 'counselor' | 'teacher' | 'student' | 'parent';

export interface School {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  principal?: string;
  website?: string;
  socialMedia?: string;
  viceEducationDirector?: string;
  isDefault?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  institution: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  selectedSchool: School | null;
  userSchools: School[];
  selectSchool: (school: School, skipReload?: boolean) => void;
  needsSchoolSelection: boolean;
  loadUserSchools: () => Promise<School[]>;
}

// =================== ROLE PERMISSIONS ===================

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  counselor: [
    'view_all_analytics',
    'export_filtered_data',
    'view_predictive_analysis',
    'view_comparative_reports',
    'view_progress_charts',
    'view_early_warnings',
    'manage_interventions',
    'view_student_details'
  ],
  teacher: [
    'view_class_analytics',
    'export_class_data',
    'view_progress_charts',
    'view_early_warnings',
    'view_own_students'
  ],
  student: [
    'view_own_progress',
    'view_own_sessions',
    'view_own_records'
  ],
  parent: [
    'view_child_progress',
    'view_child_sessions',
    'message_school'
  ]
};

// =================== STORAGE KEYS ===================
const SELECTED_SCHOOL_KEY = 'rehber360_selected_school';

// =================== CONTEXT ===================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


// =================== PROVIDER ===================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [userSchools, setUserSchools] = useState<School[]>([]);
  const [needsSchoolSelection, setNeedsSchoolSelection] = useState(false);

  // Load user schools from API
  const loadUserSchools = useCallback(async (): Promise<School[]> => {
    try {
      const response = await fetch('/api/schools/my-schools', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.schools) {
          setUserSchools(result.schools);
          return result.schools;
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load user schools:', error);
      return [];
    }
  }, []);

  // Select a school and persist to storage
  const selectSchool = useCallback((school: School, skipReload = false) => {
    const previousSchool = selectedSchool;
    setSelectedSchool(school);
    setNeedsSchoolSelection(false);
    localStorage.setItem(SELECTED_SCHOOL_KEY, JSON.stringify(school));
    
    // Okul değiştiğinde tüm cache'i temizle ve sayfayı yenile
    if (previousSchool && previousSchool.id !== school.id && !skipReload) {
      console.log('[Auth] Okul değişti, sayfa yenileniyor...', { from: previousSchool.name, to: school.name });
      queryClient.clear();
      // Sayfayı yenile - tüm verilerin doğru okula göre yüklenmesini sağla
      window.location.href = '/';
    }
  }, [selectedSchool]);

  // Set up auth interceptor to add user ID header
  useEffect(() => {
    const authInterceptor = (config: RequestInit) => {
      const headers = new Headers(config.headers);
      if (user?.id) {
        headers.set('x-user-id', user.id);
      }
      return { ...config, headers };
    };

    apiClient.getInterceptors().addRequestInterceptor(authInterceptor);
  }, [user?.id]);

  // Load user from cookie-based session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch('/api/users/current', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            const userWithPermissions = {
              ...result.user,
              permissions: ROLE_PERMISSIONS[result.user.role as UserRole] || []
            };
            setUser(userWithPermissions);
            setIsAuthenticated(true);

            // Load user schools
            const schools = await loadUserSchools();
            
            // Always show school selection screen - let user choose
            localStorage.removeItem(SELECTED_SCHOOL_KEY);
            setSelectedSchool(null);
            setNeedsSchoolSelection(true);
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSession();
  }, [loadUserSchools, selectSchool]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.user) {
        const userWithPermissions = {
          ...result.user,
          permissions: ROLE_PERMISSIONS[result.user.role as UserRole] || []
        };
        
        setUser(userWithPermissions);
        setIsAuthenticated(true);

        // Load user schools after login
        await loadUserSchools();
        
        // Always show school selection screen - let user choose
        localStorage.removeItem(SELECTED_SCHOOL_KEY);
        setSelectedSchool(null);
        setNeedsSchoolSelection(true);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setSelectedSchool(null);
      setUserSchools([]);
      setNeedsSchoolSelection(false);
      localStorage.removeItem(SELECTED_SCHOOL_KEY);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    selectedSchool,
    userSchools,
    selectSchool,
    needsSchoolSelection,
    loadUserSchools,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Loading screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-primary">Rehber360</div>
            <div className=" rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      )}
      
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// =================== PERMISSION COMPONENTS ===================

interface PermissionGuardProps {
  permission?: string;
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ 
  permission, 
  role, 
  fallback = null, 
  children 
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// =================== PRIVATE ROUTE GUARD ===================

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, needsSchoolSelection } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (needsSchoolSelection) {
    return <Navigate to="/okul-sec" replace />;
  }

  return <>{children}</>;
}

// =================== ROLE-BASED RESTRICTIONS ===================

export function getRoleBasedStudentFilter(userRole: UserRole, userId: string): (studentId: string) => boolean {
  switch (userRole) {
    case 'counselor':
      return () => true; // Can see all students
    
    case 'teacher':
      return () => true; // Teachers can see all students in their assigned classes
    
    case 'student':
      return (studentId: string) => studentId === userId; // Can only see themselves
    
    case 'parent':
      return () => false; // Parents see through different interface
    
    default:
      return () => false;
  }
}

export function getExportPermissions(userRole: UserRole): {
  canExportAll: boolean;
  canExportFiltered: boolean;
  allowedFormats: ('json' | 'csv')[];
  maxRecords?: number;
} {
  switch (userRole) {
    case 'counselor':
      return {
        canExportAll: false,
        canExportFiltered: true,
        allowedFormats: ['json', 'csv'],
        maxRecords: 1000,
      };
    
    case 'teacher':
      return {
        canExportAll: false,
        canExportFiltered: true,
        allowedFormats: ['csv'],
        maxRecords: 100,
      };
    
    case 'student':
      return {
        canExportAll: false,
        canExportFiltered: false,
        allowedFormats: [],
      };
    
    case 'parent':
      return {
        canExportAll: false,
        canExportFiltered: false,
        allowedFormats: [],
      };
    
    default:
      return {
        canExportAll: false,
        canExportFiltered: false,
        allowedFormats: [],
      };
  }
}
