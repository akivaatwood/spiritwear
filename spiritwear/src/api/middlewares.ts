import { defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
    routes: [
        {
            matcher: "/admin/school-directory/upload-mascot",
            method: "POST",
            bodyParser: {
                sizeLimit: "10mb",
            },
        },
        {
            matcher: "/admin/organization-directory/upload-mascot",
            method: "POST",
            bodyParser: {
                sizeLimit: "10mb",
            },
        },
    ],
})
