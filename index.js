const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const { User } = require('./models/User')

app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded 형식으로 된 데이터를 분석해서 가져올 수 있게 해주는 코드
app.use(bodyParser.json()) // application/json 형식으로 된 데이터를 분석해서 가져올 수 있게 해주는 코드
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose
.connect('mongodb+srv://dazzel3:dazzle301@react-node-cluster.w6ih3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
.then(() => console.log('mongoDB Connected'))
.catch(err => console.log(err))


app.post('/register', (req, res) => {

    // 회원가입 할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터베이스에 넣어준다.


    const user = new User(req.body)

    // 데이터 저장 전에 비밀번호 암호화

    user.save((err) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })

})

app.post('/login', (req, res) => {
    // 1. 요청된 이메일을 데이터베이스에서 있는지 찾기
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        
        // 2. 있다면 비밀번호가 일치하는지 확인하기
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) return res.json({
                loginSuccess: false,
                message: "비밀번호 들렸습니다."
            })

            // 3. 일치한다면 토큰 생성하기
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err)

                // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 등..
                res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true,
                    userId: user._id
                })

            })
        })
    })
    
    
})

app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, () => console.log(`Example app listening on port ${port}`));


