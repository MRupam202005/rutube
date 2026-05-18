class ApiResponse{
    constructor(
        statusCode,
        data,
        message="Success",
    ){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        
        if(stack){ 
            this.stack = stack;
        }else{
            this.stack = Error.captureStackTrace(this, this.constructor);   
        }
    } 
}

export { ApiResponse }  