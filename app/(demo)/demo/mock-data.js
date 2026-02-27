// Shared mock data for demo routes (fixed dates to avoid hydration mismatch)

export const MOCK_USER_DATA = {
  displayName: 'Demo User',
  goalDays: 30
};

export const MOCK_ENTRIES = [
  {
    id: 'demo-1',
    uid: 'demo-user',
    date: '2025-02-27',
    minutes: 75,
    workedOn: 'Built a Next.js dashboard with Firestore integration and real-time updates',
    languages: ['JavaScript', 'TypeScript'],
    tools: ['VS Code', 'Git', 'Next.js', 'Firebase'],
    learned: 'Firebase security rules and Firestore query optimization for real-time data'
  },
  {
    id: 'demo-2',
    uid: 'demo-user',
    date: '2025-02-26',
    minutes: 90,
    workedOn: 'Implemented REST API endpoints and added form validation with React Hook Form',
    languages: ['TypeScript', 'JavaScript'],
    tools: ['VS Code', 'Postman', 'Docker', 'Git'],
    learned: 'Schema validation with Zod and proper error handling patterns'
  },
  {
    id: 'demo-3',
    uid: 'demo-user',
    date: '2025-02-25',
    minutes: 60,
    workedOn: 'Refactored components and improved Tailwind CSS utility usage',
    languages: ['JavaScript', 'CSS'],
    tools: ['VS Code', 'Chrome DevTools', 'Git'],
    learned: 'Tailwind responsive design patterns and component composition'
  }
];
