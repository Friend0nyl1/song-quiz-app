import axios from "axios";
const oAuth = process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT;

export const authServer = axios.create({
    baseURL: `${oAuth}`,
})
