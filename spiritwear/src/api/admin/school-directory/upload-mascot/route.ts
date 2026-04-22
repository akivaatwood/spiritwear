import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

type UploadBody = {
  filename?: string
  mimeType?: string
  contentBase64?: string
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { filename, mimeType, contentBase64 } = (req.body || {}) as UploadBody

    if (!filename || !mimeType || !contentBase64) {
      return res.status(400).json({
        message: "filename, mimeType, and contentBase64 are required",
      })
    }

    const buffer = Buffer.from(contentBase64, "base64")
    const fileModuleService: any = req.scope.resolve(Modules.FILE)

    let result: any

    if (typeof fileModuleService.createFiles === "function") {
      result = await fileModuleService.createFiles([
        {
          filename,
          mimeType,
          content: buffer,
          access: "public",
        },
      ])
    } else if (typeof fileModuleService.uploadFiles === "function") {
      result = await fileModuleService.uploadFiles([
        {
          filename,
          mimeType,
          content: buffer,
          access: "public",
        },
      ])
    } else {
      return res.status(500).json({
        message:
          "Resolved file module service, but neither createFiles nor uploadFiles exists on it.",
        availableMethods: Object.keys(fileModuleService || {}),
      })
    }

    const file = Array.isArray(result) ? result[0] : result

    return res.status(200).json({
      ok: true,
      file,
      url: file?.url || null,
      key: file?.key || null,
    })
  } catch (e: any) {
    console.error("Mascot upload failed:", e)

    return res.status(500).json({
      message: e?.message || "Unknown upload error",
      stack: process.env.NODE_ENV === "development" ? e?.stack : undefined,
    })
  }
}