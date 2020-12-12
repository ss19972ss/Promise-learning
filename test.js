const p = new Promise((resolve,reject)=>{
    resolve(1)
})
const q = p.then(
    value=>{
        return new Promise.reject(value)
    },
    reason=>{
        throw new Error("err:",reason)
    }
)
console.log(q)