"use client"
import React, { use, useCallback, useContext, useEffect, useState } from 'react';
import { getAccountService  } from '../service/auth';
import { ApiResponse } from '../interface/response';
import { log } from 'console';
import { usePathname, useRouter } from 'next/navigation';
import { get } from 'http';
import { Route } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
export interface Account {
    email: string;
    password: string;
    displayname : string
}

export interface Register {
    username: string;
    displayname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface Login {
    email: string;
    password: string;
}

interface AuthContextProps {
    account: Account ;
    access_token : string;
    loading : boolean;
    logout : () => void;
    setAccess_token: (access_token: string) => void;
}
interface tokenData{
    exp: number
}

const REDIRECT_URI = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID;
export const AuthContext = React.createContext<AuthContextProps | undefined>(undefined); 



export const AuthProvider  = ({ children }: { children: React.ReactNode }) => {
    const [access_token , setAccess_token] = useState<string>('');
    const [account , setAccount] = useState<Account>({ email: '', password: '' , displayname : ''});
    const [loading , setLoading] = useState<boolean>(true);
    const router = useRouter();
    const url = usePathname();



    useEffect(() => {

        if(access_token){
            handleRefreshToken();
            getAccount(access_token);
        }
        setAccess_token(access_token ?? '');
        setLoading(false);
    }, [url]);

    const logout = () => {
        setAccount({ email: '', password: ''  , displayname : ''});
        localStorage.removeItem('lab-token-access');
        localStorage.removeItem('oauth_state');
        localStorage.removeItem('access_token');
        router.push('/');
    }
    const handleRefreshToken = useCallback( async () => {
        const access_token = localStorage.getItem('access_token');
        if( access_token){
            const decode : tokenData = jwtDecode(access_token);
            const expires_date = decode.exp * 1000;
            const now = new Date().getTime();
            // expires_date = new Date(expires_date);
            if(expires_date > now){
                const response = await axios.post("/auth/api/exchange-code", { code : "NOT HAVE",redirect_uri: REDIRECT_URI,grant_type: "refresh_token", client_id: CLIENT_ID ,scope : "openid" });
                const { access_token , expires_in} = response.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('expires_in', expires_in);
            }
        }
    },[router])

    const getAccount = async (token : string) => {
        try {
            const response = await getAccountService(token);
            if(response.success){
                setAccount(response.data);
            }else{
                logout();
            }
        }catch (error) {
            console.error(error);
        }
    }


    return (
        <AuthContext.Provider value={{ account ,   access_token , loading ,  logout , setAccess_token}}>
            {children}
        </AuthContext.Provider> 
    );
}