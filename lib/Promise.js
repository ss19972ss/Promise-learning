/* 
自定义Promise函数模块：IIFE
*/
(function (window){
/* Promise构造函数
   executor：执行器函数（同步执行）
*/
  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'
  

  function Promise1(executor){
      this.status = PENDING  
      this.data = undefined //用于存储结果数据的属性
      this.callbacks = [] //每个元素的结构：{ onResolved(){}, onRejected(){} }每个元素就是一个回调函数
      const _this = this
      function resolve(value){
          if(_this.status!==PENDING){
              return
          }
          _this.status = RESOLVED
          _this.data = value
          //如果有待执行的callback函数，立即异步执行回调函数onResolved
          if(_this.callbacks.length>0){
              setTimeout(()=>{ //放入队列中执行所有成功的回调
                  _this.callbacks.forEach(callbacksObj => {
                      callbacksObj.onResolved(value)
                  });
              })
          }
      }
      function reject(reason){
          if(_this.status!==PENDING){
              return
          }
          _this.status = REJECTED
          _this.data = reason
          //如果有待执行的callback函数，立即异步执行回调函数onRejected
          if(_this.callbacks.length>0){
              setTimeout(()=>{ //放入队列中执行所有失败的回调
                 _this.callbacks.forEach(callbacksObj => {
                      callbacksObj.onRejected(reason)
                  });
              })
          }
      }
      try{ //执行器函数立即执行
        executor(resolve,reject)
      }catch(err){
          reject(err)
      }
  }
  /**  Promise原型对象的then()
  *todo 指定成功和失败的回调函数，返回一个新的promise
  */
  Promise1.prototype.then = function(onResolved,onRejected){
      onResolved = typeof onResolved==='function'? onResolved : value=>value
      /* 指定默认的失败的回调（实现错误/异常传透的关键点） */
      onRejected = typeof onRejected==='function'? onRejected : reason=>{ throw reason }

      const _this =this
      return new Promise1((resolve,reject)=>{
        /**
        *todo 1.如果抛出异常,return的promise就会失败，reason就是error
        *todo 2.如果回调函数返回的不是promise，return的promise就会成功，value就是返回的值
        *todo 3.如果回调函数返回的是promise，return的promise的结果就是这个promise的结果  
        */ 
        function handle(callback){ //封装需要复用的方法
          try {
              const result = callback(_this.data) //执行then中的回调，获取结果
              if(result instanceof Promise1){ //3
                result.then(
                  value=>{resolve(value)},
                  reason=>{reject(reason)}
                )
              }else{ //2
                resolve(result)
              }
          }catch(err){ //1
              reject(err)
          }
        }  
        if(_this.status===PENDING){ //pending状态时，保存回调函数
            _this.callbacks.push({
                onResolved(value){
                    handle(onResolved)
                },
                onRejected(reason){
                    handle(onRejected)
                }
            }) //将then中的两个函数加进回调队列
        }else if(_this.status===RESOLVED){ //resolved状态时，异步执行onResolved，并改变return的Promise状态
            setTimeout(()=>{
                handle(onResolved)
            })
        }else{ //rejected
            setTimeout(()=>{
                handle(onRejected)
            })
        } 
      })
      
  }
  /**  Promise原型对象的catch()
  *todo 指定失败的回调函数，返回一个新的Promise 
  */
  Promise1.prototype.catch = function(onRejected){
      return this.then(undefined,onRejected)
  }
  /** Promise函数对象的resolve方法
  *todo 返回一个指定结果为成功的promise 
  */
  Promise1.resolve = function(value){
      return new Promise1((resolve,reject)=>{
          if(value instanceof Promise1){ //使用value的结果作为promise的结果
              value.then(resolve,reject)
          }else{ //value不是Promise=》promise变为成功，数据是value
              resolve(value)
          }
      })
  }
  /** Promise函数对象的rejected方法
  *todo 返回一个指定reason的失败的promise
  */
  Promise1.reject = function(reason){
      return new Promise1((resolve,reject)=>{
          reject(reason)
      })
  }
  /** Promise函数对象的all方法
  *todo 返回一个promise，只有当所有promise都成功时才成功，否则失败
  */
  Promise1.all = function(promises){
      //用来保存所有成功的value
      const values = new Array(promises.length)
      let count = 0

      return new Promise1((resolve,reject)=>{
          promises.forEach((item,index)=>{ 
              Promise1.resolve(item).then(//防止数组参数中有常量，直接包进promise中 
                  value=>{
                      count++
                      values[index] = value
                      if(count===promises.length){
                          resolve(values)
                      }
                  },
                  reason=>{
                      reject(reason)
                  }
              )
          })
      })
  }
  /** Promise函数对象的race方法 
  *todo 返回一个promise，其结果由第一个完成的promise决定
  */
  Promise1.race = function(promises){
      return new Promise1((resolve,reject)=>{
        promises.forEach((item,index)=>{
            Promise1.resolve(item).then(
                value=>{
                    resolve(value)
                },
                reason=>{
                    reject(reason)
                }
            )
        })
      })
  }

  /* 返回一个promise对象，它在指定时间后才确定结果 */
  Promise1.resolveDelay = function(value,time){
      return new Promise1((resolve,reject)=>{
          setTimeout(()=>{
            if(value instanceof Promise1){
                value.then(resolve,reject)
            }else{
                resolve(value)
            }
          },time)
      })
  }

  /* 返回一个promise对象，它在指定时间后才失败 */
  Promise1.rejecteDelay = function(reason,time){
    return new Promise1((resolve,reject)=>{
        setTimeout(()=>{
            if(reason instanceof Promise1){
                value.then(resolve,reject)
            }else{
                reject(value)
            }
        },time)
    })
  }
  window.Promise1 = Promise1  //向外暴露Promise函数
})(window)