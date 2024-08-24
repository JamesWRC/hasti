import { User } from "@/backend/interfaces/user";
import { GetUsersQueryParams } from "@/backend/interfaces/user/request";


export interface LoadUsers {
    users: User[] | null;
    totalUsers: number;
    reqStatus: string;
    setSearchProps: React.Dispatch<React.SetStateAction<GetUsersQueryParams>>
}