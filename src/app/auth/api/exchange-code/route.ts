import axios from 'axios';
import qs from 'qs';
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const host = process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT; 

const CLIENT_SECRET = process.env.CLIENT_SECRET; // ไม่มี NEXT_PUBLIC

export async function POST(req: NextRequest) {

  if (req.method === 'POST') {
    const body = await req.json();
    // console.log(body);
    const { code, redirect_uri ,grant_type ,scope , client_id  } = body;
    // console.log(code, redirect_uri ,grant_type ,scope ,refresh_token);
    const currentCookies = (await cookies()).get('refresh_token')?.value;
    if (!code || !redirect_uri) {
      return NextResponse.json({ message: 'Missing code or redirect_uri' }, { status: 400 });
    }

    try {
      const data = qs.stringify({
        code: code,
        grant_type: grant_type,
        redirect_uri: redirect_uri,
        client_id: client_id ,
        client_secret: CLIENT_SECRET ,
        scope: scope,
        refresh_token :  currentCookies?? "NOT HAVE REFRESH TOKEN"
      });
      console.log(data);

      const tokenResponse = await axios.post(`${host}/api/v1/Token/token`, data, {
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:3000",
          "Content-Type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Credentials": 'true',
          withCredentials: true
        },
      });

      const { access_token, id_token, expires_in , refresh_token } = tokenResponse.data;

      const response = NextResponse.json({
        access_token: access_token,
        id_token: id_token, // สำหรับ OpenID Connect
        expires_in: expires_in,
        // refresh_token :refresh_token
      });

      // Corrected: Return the response after setting the cookie
      response.cookies.set("access_token", access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      response.cookies.set("refresh_token", refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      response.cookies.set("expires_in", expires_in, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      return response;

    } catch (error: any) { // Use 'any' for simpler error handling if you're not strictly typing Axios errors
      console.error("Error exchanging code for tokens on backend:", error.response?.data || error.message);

      return NextResponse.json(
        { message: `Error exchanging code for tokens on backend: ${error }` },
        { status: error.response?.status || 500 }
      );
    }
  } else {
    // This handles non-POST requests
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }
}