const routes = require("./pretest.js");

describe('Integration test', () => {

    test('Register', async () => {
        const info = {
            "username": "test23",
            "email": "test23@gmail.com",
            "password": "123"
        };
        const res = await routes.register(info);
        const data = res.status;
        expect(data).toBe(201);
    });

    test('Register with existed email', async () => {
        const info = {
            "username": "test22",
            "email": "test22@gmail.com",
            "password": "123"
        };
        const res = await routes.register(info);
        const data = res.status;
        expect(data).toBe(409);
    });

    test('Login With Wrong Password', async () => {
        const info = {
            "email": "test23@gmail.com",
            "password": "1234"
        };
        const res = await routes.login(info);
        const data = res.status;
        expect(data).toBe(401);
        
    });

    let accessToken = '';
    let refreshToken='';

    test('Login with Correct Password', async () => {
        const info = {
            "email": "test23@gmail.com",
            "password": "123"
        };
        const res = await routes.login(info);
        const data = res.status;
        accessToken = res.data.accessToken;
        refreshToken = res.data.refreshToken;
        console.log(refreshToken);
        expect(data).toBe(200);
        
    });

    test('User API', async()=>{
        const res = await routes.userapi(accessToken);
        const data = res.status;
        expect(data).toBe(200);
    });
    
    test("Try to access admin page", async()=>{
        const res = await routes.admin(accessToken);
        const data = res.status;
        expect(data).toBe(403);
    })

    let newaccessToken ='';

    test("refreshtoken" ,async()=>{
        const info = {"refreshToken":refreshToken};
        const res = await routes.refresh(info);
        const data = res.status;
    
     newaccessToken = res.data.accessToken;
      
        expect(data).toBe(200);
    })

    test('Try User API with new accessToken', async()=>{
        const res = await routes.userapi(newaccessToken);
        const data = res.status;
        expect(data).toBe(200);
    });

    test('Logout', async()=>{
        const res = await routes.logout(newaccessToken);
        const data = res.status;
        expect(data).toBe(200);
    });

    test('Try User API after logout', async()=>{
        const res = await routes.userapi(newaccessToken);
        const data = res.status;
        expect(data).toBe(401);
    });

});

