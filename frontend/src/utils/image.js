export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Images are served from the frontend public/uploads folder in this project structure
  const backendUrl = ''; 
  
  return backendUrl + path;
};
