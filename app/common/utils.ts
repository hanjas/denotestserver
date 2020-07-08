const succReply = (data: any, msg: string, ctx: any) => {
    ctx.response.status == 200;
    ctx.response.body = {"status":"SUCCESS", "data":data, "err": null, "msg":msg};
};

const failReply = (data: any, msg: string, ctx: any) => {
    ctx.response.status == 400;
    ctx.response.body = {"status":"FAILURE", "err":data, "data": null, "msg":msg};
};

const forbidReply = (data: any, msg: string, ctx: any) => {
    ctx.response.status == 403;
    ctx.response.body = {"status":"FAILURE", "err":data, "data": null, "msg":msg};
};

const authFailure = (msg: string, ctx: any) => {
    ctx.response.status = 401;
    ctx.response.body = {"status":"FAILURE", "data":null, "err":{}, "msg":msg};
};

const generalCallback = (ctx: any) => {
    return (err: any, data: any, msg: string) => {
        if (err)
            failReply(err, msg, ctx);
        else
            succReply(data, msg, ctx);
    }
};

const checkallkeys = (reqobj: object, reqkeys: string[]) => {
    for (let i in reqkeys)
        if (!(reqkeys[i] in reqobj))
            return [false, reqkeys[i]];
    return [true, null];
};

const verifyapiargs = async (ctx: any, next: any, reqkeys: string[]) => {
    let {value} = await ctx.request.body();
    let isallkeys = await checkallkeys(value, reqkeys);
    if(!isallkeys[0])
        failReply('MISSING_API_ARGUMENTS', "key not found : " + isallkeys[1], ctx);
    else {
        return next()
    }
};

const utils = {
    succReply,
    failReply,
    forbidReply,
    authFailure,
    generalCallback,
    verifyapiargs
}

export default utils;