/** 
 *todo  1.指定回调函数的方式更灵活：
 *?          旧的：必须在启动异步任务之前指定
 *?          Promise：启动异步任务=》返回promise对象=》给Promise对象指定回调函数

 *todo  2.支持链式调用，解决回调地狱问题： 
 *?          终极方案：async await 
*/
    

//todo 1、查出当前用户信息
//todo 2、按照当前用户的id查出他的课程
//todo 3、按照当前课程id查出分数
//? 回调地狱：
$.ajax({
    url: "./mock/user.json",
    success(data) {
        console.log("查询用户：", data);
        $.ajax({
            url: `./mock/user_corse_${data.id}.json`,
            success(data) {
                console.log("查询到课程：", data);
                $.ajax({
                    url: `./mock/corse_score_${data.id}.json`,
                    success(data) {
                        console.log("查询到分数：", data);
                    },
                    error(error) {
                        console.log("出现异常了：" + error);
                    }
                });
            },
            error(error) {
                console.log("出现异常了：" + error);
            }
        });
    },
    error(error) {
        console.log("出现异常了：" + error);
    }
});

//? promise调用方式
function get(url, data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            data: data,
            success: function(data) {
                resolve(data);
            },
            error: function(err) {
                reject(err)
            }
        })
    });
}

//调用封装后的方法
get("./mock/user.json")
    .then((data) => {
        console.log("用户查询成功~~~:", data)
        return get(`./mock/user_corse_${data.id}.json`);
    })
    .then((data) => {
        console.log("课程查询成功~~~:", data)
        return get(`./mock/corse_score_${data.id}.json`);
    })
    .then((data) => {
        console.log("课程成绩查询成功~~~:", data)
    })
    .catch((err) => {
        console.log("出现异常", err) //!所有的错误都会传到这里
    });
// Promise操作明显更加符合我们人类的习惯，类似于流水线式的操作,对于异常的处理更加友好