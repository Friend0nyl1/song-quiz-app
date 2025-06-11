"use client"

import { useEffect, useState } from "react"
import {  useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axios from "axios"
import qs from "qs" 
import { useAuth } from "../hooks/authState"
const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;

const clientId = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID
export default function AuthCallback() {
  const router = useRouter()
  const { setAccess_token } = useAuth();  
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        // Check for errors in the URL
        const error = searchParams.get("error")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          setStatus("error")
          setErrorMessage(errorDescription || "Authentication failed")
          return
        }

        // Get the authorization code and state from the URL
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code) {
          setStatus("error")
          setErrorMessage("No authorization code found")
          return
        }

        // Verify state to prevent CSRF attacks
        const storedState = localStorage.getItem("oauth_state");
        if (state !== storedState) {
          setStatus("error")
          setErrorMessage("Invalid state parameter")
          return
        }
        // Exchange the code for tokens
        // const data  = qs.stringify(
            
        // )
        const data ={
                code: code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI,
                client_id: clientId ?? "",

              }

        const response = await axios.post(
          "/auth/api/exchange-code", 
          data, {withCredentials: true}
           // ส่ง formData ที่แปลงเป็น String เป็น Body โดยตรง
          
        );

        if (!response.status) {
          const errorData = response.statusText
          throw new Error(errorData || "Failed to exchange code for tokens")
        }

        const res = response.data
        // Store tokens securely (in this example, we're using localStorage, but in production
        // you might want to use cookies with HttpOnly flag or a more secure approach)
        setAccess_token(res.access_token)
        localStorage.setItem("access_token", res.access_token)
        if (res.refresh_token) {
          localStorage.setItem("refresh_token", res.refresh_token)
        }
        localStorage.setItem("expires_in", (Date.now() + res.expires_in * 1000).toString())

        // Clear the state from localStorage
        localStorage.removeItem("oauth_state")

        setStatus("success")

        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } catch (error) {
        console.error("OAuth callback error:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Authentication failed")
      }
    }

    handleOAuthCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">
            Authentication {status === "success" ? "Successful" : status === "error" ? "Failed" : "in Progress"}
          </CardTitle>
          <CardDescription>
            {status === "loading"
              ? "Processing your authentication..."
              : status === "success"
                ? "You have been successfully authenticated."
                : "There was a problem with your authentication."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-center text-sm text-muted-foreground">
                Please wait while we complete the authentication process...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-sm text-muted-foreground">
                Authentication successful! Redirecting you to the LabTools...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-sm text-muted-foreground">
                {errorMessage || "An unknown error occurred during authentication."}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "error" && <Button onClick={() => router.push("/auth/login")}>Try Again</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}
