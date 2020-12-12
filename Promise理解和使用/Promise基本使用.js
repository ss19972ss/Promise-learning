const res = new Promise((resolve,rejected)=>{//todo 执行器函数，是同步执行的，执行异步操作任务
    console.log('执行器启动')
    setTimeout(()=>{
        if(Date.now()%2===1){
            resolve('成功'+Date.now())
        }
        else{
            rejected('失败'+Date.now())
        }
    },1000)
})
console.log('new promise之后')

res.then(
    value=>{
        console.log('成功的回调：'+value)
    },
    reason=>{
        console.log('失败的回调'+reason)
    }
)