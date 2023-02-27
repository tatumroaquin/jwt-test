import express, { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const users = [
  { username: 'tatum', password: 'tatum' },
  { username: 'john', password: 'smith' },
];

app.get('/', (_, res) => {
  res.render('index.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  let token, message;

  const hasUser = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!hasUser) {
    token = null;
    message = 'Wrong username or password';
    return res.status(403).json({ token, message });
  }

  token = jwt.sign(username, 'supersecretkey');
  message = "Login successful";

  res.json({ token, message });
});

function authenticate(req: Request, res: Response, next: NextFunction) {
  let { token } = req.body;
  let message: string;

  if (!token) {
    message = 'No token!';
    return res.status(403).json({ token, message });
  }

  jwt.verify(token, 'supersecretkey', <T>(error: VerifyErrors | null, payload: T) => {
    if (error) {
      message = 'Invalid token!';
      return res.status(403).json({ token, message })
    }

    req.body.payload = payload;
    next();
  })
}

app.post('/getusers', authenticate, (_, res) => {
  res.json(users);
})

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
