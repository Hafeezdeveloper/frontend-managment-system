// Mock data for departments
export const baseUrl = "http://192.168.0.107:5000/api"
export const Departments = [
  { value: 'cs', name: 'Computer Science' },
  { value: 'ee', name: 'Electrical Engineering' },
  { value: 'me', name: 'Mechanical Engineering' },
  { value: 'ce', name: 'Civil Engineering' },
  { value: 'bt', name: 'Biotechnology' },
];

export const PortalRoleOptions = [
  { key: 'all', name: 'All' },           // 👈 Add this line
  { key: 'student', name: 'Student' },
  { key: 'teacher', name: 'Teacher' },
  { key: 'faculty', name: 'Faculty' },
];

export const EmployementType = [
  { key: 'Full-time', name: 'Full-time' },           // 👈 Add this line
  { key: 'Part-time', name: 'Part-time' },
  { key: 'Contract', name: 'Contract' },
  { key: 'Internship', name: 'Internship' },
];

export const JobType = [
  { key: 'On-site', name: 'On-site' },           // 👈 Add this line
  { key: 'Remote', name: 'Remote' },
  { key: 'Hybrid', name: 'Hybrid' },
];

export const isNotEmpty = (data: any): boolean => {
  if (Array.isArray(data)) {
    return data.length > 0;
  } else if (typeof data === 'object' && data !== null) {
    return Object.keys(data).length > 0;
  }
  return !!data; // If it's a string, check if it's non-empty
}

export const truncateString = (str: string = '', maxLength: number = 10): string => {
  if (str?.length > maxLength) {
    return str?.substring(0, maxLength) + '...';
  }
  return str;
};


export function createMessageWithLinks(text: any) {
  if (!text) return [''];

  return text.split(" ").map((word: any, i: any) => {
    // Define the regex inside the loop
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;

    // Check if the word is a URL using regex
    if (urlRegex.test(word)) {
      return (
        <a
          key={i}
          href={word}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'blue', textDecoration: 'underline' }}
        >
          {word}
        </a>
      );
    }
    return word + " ";  // Return the word with a space
  });
}

export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}


export const validatePassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  return passwordRegex.test(password);
};
