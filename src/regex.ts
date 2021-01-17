//Letters, numbers, dashes, and underscores only
export const usernameRe = /^[a-zA-Z0-9\-_]+$/;

//The email address contains two parts, separated with an @ symbol.
//The email address does not contain dangerous characters (such as backticks, single or double quotes, or null bytes).
//The domain part contains only letters, numbers, hyphens (-) and periods (.).        
export const emailRe = /^[^`'"@]+@[a-zA-Z0-9\-\.]+\.[a-zA-Z0-9\-\.]+$/;