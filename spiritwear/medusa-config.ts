import { defineConfig } from "@medusajs/framework/utils"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors:
        process.env.STORE_CORS || "http://localhost:3000,http://localhost:8000",
      adminCors:
        process.env.ADMIN_CORS || "http://localhost:7001,http://localhost:9000",
      authCors:
        process.env.AUTH_CORS || "http://localhost:7001,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },

  modules: [
    {
      resolve: "./src/modules/school-directory",
    },

    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION || "eu-north-1",
              bucket: process.env.S3_BUCKET,
              endpoint:
                process.env.S3_ENDPOINT ||
                "https://s3.eu-north-1.amazonaws.com",
            },
          },
        ],
      },
    },
  ],
})
