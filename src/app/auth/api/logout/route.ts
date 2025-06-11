import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    if (request.method === "POST") {
       try{
            (await cookies()).delete('auth');
        return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
       }catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
       }
        
    }else{
        return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
    }
    
}