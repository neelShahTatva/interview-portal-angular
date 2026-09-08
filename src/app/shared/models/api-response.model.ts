export interface ApiResponse<T>{
    statusCode:number,
    success:boolean,
    errorMessages?:string[],
    result:T | null
}