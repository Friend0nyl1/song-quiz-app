
import { authServer } from "./axios";   
import { Login } from "../hooks/authContext";
import { ApiResponse } from "../interface/response";




export const getAccountService = async (token: string) : Promise<ApiResponse<any>> => {
    const bearer = localStorage.getItem("access_token");
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${bearer}`
    }
    try{
        const response = await authServer.get<ApiResponse<any>>(`/api/v1/Account/account`, { headers });
        console.log(response.data);
        return response.data;
    }catch (error) {
        console.error(error);
        return { data : null  , message : "error" , success : false };
    }
}
