import { Response } from 'express';
import { randomBytes } from 'crypto';
import * as schoolsRepository from '../repository/schools.repository.js';
import * as usersRepository from '../../users/repository/users.repository.js';
import { AuthenticatedRequest } from '../../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

export function getMySchools(req: AuthenticatedRequest, res: Response): void {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    
    const schools = usersRepository.getUserSchools(userId);
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Error fetching user schools:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
}

export function getAllSchools(req: AuthenticatedRequest, res: Response): void {
  try {
    const schools = schoolsRepository.getAllSchools();
    res.json({ success: true, schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
}

export function getSchoolById(req: AuthenticatedRequest, res: Response): void {
  try {
    const school = schoolsRepository.getSchoolById(req.params.schoolId);
    if (!school) {
      res.status(404).json({ success: false, message: 'School not found' });
      return;
    }
    res.json({ success: true, school });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school' });
  }
}

export function createSchool(req: AuthenticatedRequest, res: Response): void {
  try {
    const { name, code, address, phone, email, principal } = req.body;
    
    if (!name) {
      res.status(400).json({ success: false, message: 'School name is required' });
      return;
    }
    
    const existingSchool = schoolsRepository.getSchoolByName(name);
    if (existingSchool) {
      res.status(400).json({ success: false, message: 'School already exists' });
      return;
    }
    
    const schoolId = `school-${randomBytes(8).toString('hex')}`;
    schoolsRepository.insertSchool(schoolId, name, code, address, phone, email, principal);
    
    const userId = req.user?.id;
    if (userId) {
      usersRepository.addUserToSchool(userId, schoolId);
    }
    
    const school = schoolsRepository.getSchoolById(schoolId);
    res.json({ success: true, school });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ success: false, message: 'Failed to create school' });
  }
}
