export type AllowedUserData = {
  name: string;
};

export const ALLOWED_USERS: Record<string, AllowedUserData> = {
  "nikhil.sakat@rajaram.com": { name: "Nikhil Sakat" },
  "megha.jadhav@rajaram.com": { name: "Megha Jadhav" },
  "kiran.yadav@rajaram.com": { name: "Kiran Yadav" },
};

export const ALLOWED_USER_NAMES = Object.values(ALLOWED_USERS).map((user) => user.name);
