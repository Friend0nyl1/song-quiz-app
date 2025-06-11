import axios from "axios";
import { NextRequest  , NextResponse} from "next/server";


export async function GET(request: NextRequest , ) {
    if (request.method === "GET") {
        const playlist = await  axios.get("http://192.168.1.5:3000/api/playlist");
        return NextResponse.json(playlist.data);
    }
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}