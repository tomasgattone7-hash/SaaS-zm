export const googleConfig = {
  financialFolderId: process.env.GOOGLE_FINANCIAL_FOLDER_ID,
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};
