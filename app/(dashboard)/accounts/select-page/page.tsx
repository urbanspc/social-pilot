"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"

interface PageOption {
  id: string
  name: string
  picture: string | null
}

function SelectPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [pages, setPages] = useState<PageOption[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [sessionData, setSessionData] = useState<any>(null)

  useEffect(() => {
    try {
      const raw = searchParams.get("data")
      if (!raw) { setError("Missing data"); return }
      const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf8"))
      setPages(decoded.pages || [])
      setSessionData(decoded)
    } catch {
      setError("Invalid data")
    }
  }, [searchParams])

  const connectPage = async (page: PageOption) => {
    setConnecting(page.id)
    setError("")
    try {
      const res = await fetch("/api/auth/meta/connect-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          longToken: sessionData.longToken,
          expiresIn: sessionData.expiresIn,
          userId: sessionData.userId,
          platform: sessionData.platform,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Connection failed")
      router.push("/accounts?success=facebook+connected")
    } catch (err: any) {
      setError(err.message || "Connection failed")
      setConnecting(null)
    }
  }

  if (error && pages.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: 20 }}>
        <p style={{ color: "#ef4444" }}>{error}</p>
        <button onClick={() => router.push("/accounts")}
          style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
          Back to accounts
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 500, margin: "80px auto", padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Select a Facebook Page</h2>
      <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
        Choose which page you want to connect to Social Copilot.
      </p>

      {error && (
        <div style={{ padding: 12, background: "#fef2f2", borderRadius: 8, marginBottom: 16, color: "#ef4444", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => connectPage(page)}
            disabled={!!connecting}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
              border: "1px solid #e5e7eb", borderRadius: 12, background: connecting === page.id ? "#f3f4f6" : "#fff",
              cursor: connecting ? "not-allowed" : "pointer", transition: "all 0.15s",
              textAlign: "left", width: "100%",
            }}
          >
            {page.picture ? (
              <img src={page.picture} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 8, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#9ca3af" }}>
                f
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{page.name}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Facebook Page</div>
            </div>
            {connecting === page.id ? (
              <span style={{ fontSize: 13, color: "#6b7280" }}>Connecting...</span>
            ) : (
              <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 500 }}>Connect</span>
            )}
          </button>
        ))}
      </div>

      <button onClick={() => router.push("/accounts")}
        style={{ marginTop: 24, padding: "10px 24px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, color: "#6b7280" }}>
        Cancel
      </button>
    </div>
  )
}

export default function SelectPagePage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 80 }}>Loading...</div>}>
      <SelectPageContent />
    </Suspense>
  )
}
