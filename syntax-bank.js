// syntax-bank.js — SYNTAX_BANK data and LANG_CONFIG metadata
// Loaded before script.js in index.html

const LANG_CONFIG = {
  javascript: { label: 'JavaScript', icon: 'JS',  badgeClass: 'badge-js'   },
  nodejs:     { label: 'Node.js',    icon: 'ND',  badgeClass: 'badge-node' },
  react:      { label: 'React',      icon: 'RE',  badgeClass: 'badge-react'},
  php:        { label: 'PHP',        icon: 'PHP', badgeClass: 'badge-php'  },
  csharp:     { label: 'C#',         icon: 'C#',  badgeClass: 'badge-cs'   },
  python:     { label: 'Python',     icon: 'PY',  badgeClass: 'badge-py'   },
  java:       { label: 'Java',       icon: 'JV',  badgeClass: 'badge-java' },
  go:         { label: 'Go',         icon: 'GO',  badgeClass: 'badge-go'   },
};

// SYNTAX_BANK[lang].tier1 = snippets ≤15 chars
// SYNTAX_BANK[lang].tier2 = snippets 16–30 chars
// SYNTAX_BANK[lang].tier3 = snippets 31+ chars
const SYNTAX_BANK = {
  javascript: {
    tier1: [
      'const x = 10;', 'let y = 0;', 'return true;', 'break;', 'continue;',
      'typeof null', 'void 0;', 'delete obj;', 'throw err;', 'x += 1;',
      'x !== y', 'x === y', '!isValid', 'arr.pop()', 'arr.push(1)',
    ],
    tier2: [
      'console.log("hello");', 'const fn = () => {};', 'Array.isArray(x)',
      'Object.keys(obj)', 'JSON.parse(text)', 'JSON.stringify(x)',
      'setTimeout(fn, 1000)', 'Promise.resolve(x)', 'async function f(){}',
      'document.querySelector', 'window.addEventListener', 'Math.floor(x)',
      'arr.map(x => x * 2)', 'arr.filter(Boolean)', 'arr.reduce((a,b)=>a+b)',
    ],
    tier3: [
      'const result = arr.find(item => item.id === id);',
      'export default function Component() {}',
      'const { name, age } = person;',
      'const copy = { ...original, key: val };',
      'fetch(url).then(r => r.json()).then(cb);',
      'const handler = async (req, res) => {};',
      'class Animal { constructor(name) {} }',
      'const memoized = useMemo(() => compute(), [dep]);',
    ],
  },
  nodejs: {
    tier1: [
      'require("fs")', 'module.exports', 'process.env', '__dirname',
      '__filename', 'res.send()', 'next()', 'app.get()', 'app.use()',
      'res.json({})', 'req.body', 'req.params', 'req.query', 'res.end()',
    ],
    tier2: [
      'const fs = require("fs");', 'const path = require("path");',
      'const express = require("express");', 'app.listen(3000, cb)',
      'fs.readFile(file, cb)', 'fs.writeFile(f, d, cb)',
      'path.join(__dirname, "/")', 'process.exit(0)',
      'const http = require("http");', 'EventEmitter.emit("x")',
      'stream.pipe(writable)', 'Buffer.from("text")',
      'os.platform() === "win32"', 'cluster.fork()',
    ],
    tier3: [
      'const router = express.Router();',
      'app.use(express.json({ limit: "10mb" }));',
      'const server = http.createServer(app);',
      'fs.promises.readFile(path, "utf-8")',
      'const { promisify } = require("util");',
      'db.query("SELECT * FROM users", cb)',
      'mongoose.connect(process.env.MONGO_URI)',
      'jwt.sign({ id }, secret, { expiresIn: "1d" })',
    ],
  },
  react: {
    tier1: [
      'useState(0)', 'useEffect', 'useRef()', 'useCallback', 'useMemo',
      'props.children', 'key={id}', 'onClick={fn}', '<Fragment>',
      'ReactDOM', 'forwardRef', 'React.memo', 'useContext', 'createRef()',
    ],
    tier2: [
      'const [state, setState]', 'useEffect(() => {}, [])',
      'import React from "react";', 'export default function App()',
      'const ref = useRef(null);', 'React.createContext(null)',
      'useReducer(reducer, {})', '<StrictMode></StrictMode>',
      'ReactDOM.createRoot(el)', 'Suspense fallback={...}',
      'const ctx = useContext(Ctx)', 'React.cloneElement(el, {})',
    ],
    tier3: [
      'const [count, setCount] = useState(0);',
      'useEffect(() => { return () => cleanup(); }, [dep]);',
      'const value = useContext(ThemeContext);',
      'export const MyContext = React.createContext({});',
      'const memoVal = useMemo(() => expensive(x), [x]);',
      'const cb = useCallback(() => fn(id), [id]);',
      '<React.Suspense fallback={<Spinner />}>',
    ],
  },
  php: {
    tier1: [
      '<?php', 'echo "hi";', '$x = 10;', 'isset($x)', 'empty($arr)',
      'die("err")', 'exit(0);', 'return $x;', 'break;', 'continue;',
      '$_GET["id"]', '$_POST["n"]', 'print_r($a)', 'var_dump($x)',
    ],
    tier2: [
      '$arr = array();', 'foreach ($arr as $v)', 'function foo($x) {}',
      'echo htmlspecialchars($x)', 'json_encode($data)',
      'json_decode($json, true)', 'include "file.php";',
      'require_once "db.php";', 'session_start();',
      '$pdo = new PDO($dsn);', 'header("Content-Type: application/json");',
      'preg_match("/^[a-z]+$/i", $s)', '$str = trim($input);',
    ],
    tier3: [
      '$result = $pdo->query("SELECT * FROM users");',
      'class User { public function __construct($name) {} }',
      '$stmt = $pdo->prepare("INSERT INTO t VALUES (?)");',
      'array_map(fn($x) => $x * 2, $arr)',
      'usort($arr, fn($a, $b) => $a - $b);',
      '$filtered = array_filter($arr, fn($x) => $x > 0);',
      'namespace App\\Controllers; use App\\Models\\User;',
    ],
  },
  csharp: {
    tier1: [
      'int x = 0;', 'var y = 10;', 'return null;', 'break;', 'continue;',
      'Console.Write', 'using System;', 'string? s', 'bool flag',
      'void Foo()', 'new List<>()', 'typeof(int)', 'is not null',
    ],
    tier2: [
      'Console.WriteLine("hi");', 'var list = new List<int>();',
      'foreach (var item in col)', 'public class MyClass {}',
      'namespace MyApp { }', 'using System.Linq;',
      'int[] arr = new int[10];', 'Task.Run(() => {})',
      'await Task.Delay(1000);', 'string.IsNullOrEmpty(s)',
      'LINQ: col.Where(x => x > 0)', '.Select(x => x.Name)',
    ],
    tier3: [
      'public async Task<IActionResult> Get()',
      'var result = list.Where(x => x.Active).ToList();',
      'services.AddScoped<IRepo, RepoImpl>();',
      '[HttpGet("{id}")] public IActionResult GetById(int id)',
      'var json = JsonSerializer.Serialize(obj);',
      'using var conn = new SqlConnection(connStr);',
      'public record Person(string Name, int Age);',
    ],
  },
  python: {
    tier1: [
      'print("hi")', 'x = 10', 'return x', 'break', 'continue',
      'pass', 'None', 'True', 'False', 'len(lst)', 'range(10)',
      'type(x)', 'del x', 'global x', 'yield x',
    ],
    tier2: [
      'def hello(name):', 'class Dog:', 'import os', 'from sys import argv',
      'if __name__ == "__main__":', 'with open("f") as f:',
      'list(map(fn, lst))', 'lambda x: x * 2',
      '[x for x in lst if x > 0]', 'dict.get("key", default)',
      'os.path.join(a, b)', 'json.loads(text)',
    ],
    tier3: [
      'def __init__(self, name: str) -> None:',
      '@app.route("/api/users", methods=["GET"])',
      'async def fetch_data(url: str) -> dict:',
      'result = [x**2 for x in range(10) if x % 2 == 0]',
      'with open(path, "r", encoding="utf-8") as f:',
      'class MyModel(BaseModel): name: str; age: int',
      'cursor.execute("SELECT * FROM users WHERE id=?", (id,))',
    ],
  },
  java: {
    tier1: [
      'int x = 0;', 'return null;', 'break;', 'continue;', 'void foo()',
      'new Object()', 'this.x = x;', 'super()', 'throw ex;',
      'System.out.println', 'final int N', 'static void main',
    ],
    tier2: [
      'System.out.println("hi");', 'public class Main {}',
      'List<String> list = new ArrayList<>();',
      'for (String s : list)', 'try { } catch (Exception e) {}',
      'HashMap<String, Integer> map', 'map.put("key", 1)',
      'String.format("%s=%d", k, v)', 'Collections.sort(list)',
      'interface Runnable { void run(); }',
      '@Override public String toString()',
    ],
    tier3: [
      'public static void main(String[] args) {}',
      'List<User> users = userRepo.findAll();',
      '@GetMapping("/users") public List<User> getAll()',
      'Optional<User> user = repo.findById(id);',
      'Stream<String> s = list.stream().filter(x -> x.length() > 3);',
      'public class UserService { @Autowired UserRepo repo; }',
      'EntityManager em = emf.createEntityManager();',
    ],
  },
  go: {
    tier1: [
      'var x int', 'x := 10', 'return nil', 'break', 'continue',
      'defer f()', 'go fn()', 'chan int', 'make([]int, 0)',
      'len(slice)', 'cap(s)', 'close(ch)', 'nil', 'true',
    ],
    tier2: [
      'fmt.Println("hello")', 'func main() {}', 'package main',
      'import "fmt"', 'if err != nil { return err }',
      'for i, v := range s', 'type User struct {}',
      'map[string]int{}', 'go func() { }()',
      'sync.WaitGroup{}', 'wg.Add(1)', 'wg.Done()',
      'http.HandleFunc("/", h)', 'log.Fatal(err)',
    ],
    tier3: [
      'func (u *User) Save() error { return nil }',
      'db, err := sql.Open("postgres", connStr)',
      'rows, err := db.Query("SELECT * FROM users")',
      'http.ListenAndServe(":8080", nil)',
      'json.NewEncoder(w).Encode(response)',
      'ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)',
      'router.HandleFunc("/api/v1/users", handler).Methods("GET")',
    ],
  },
};
