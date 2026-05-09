export const googleConfig = {
  financialFolderId:
    process.env.GOOGLE_FINANCIAL_FOLDER_ID ?? "1pb6jJEN8s_XCwRk-XtJJfPbxaxjbP6_N",
  serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};
