/**
 * Helper function to add X-School-Id header to fetch requests
 */
export function getRequestHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const selectedSchoolJson = localStorage.getItem('rehber360_selected_school');
  const headers = { ...additionalHeaders };
  
  if (selectedSchoolJson) {
    try {
      const school = JSON.parse(selectedSchoolJson);
      if (school?.id) {
        headers['X-School-Id'] = school.id;
      }
    } catch {
      // Invalid school data
    }
  }
  
  return headers;
}

/**
 * Wrapper for fetch with automatic X-School-Id header
 */
export async function fetchWithSchool(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = getRequestHeaders(
    (options.headers as Record<string, string>) || {}
  );
  
  return fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include'
  });
}
