import express from 'express';
import bodyParser from 'body-parser';
import sqlite from 'better-sqlite3';


const app = express()
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const db = new sqlite('todos.db')

db.prepare(`
    CREATE TABLE IF NOT EXISTS todos(
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       title TEXT,
       completed BOOLEAN NOT NULL DEFAULT 0
    )
`).run()


app.get('/todos',(req,res) =>{
    db.all("SELECT * FROM todos",[], (err,rows)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        res.json({todos:rows});
    })
})

app.get('/todos/:id',(req,res)=>{
   const {id} = req.params
   db.get('SELECT * FROM todos WHERE id = ?', [id],(err,row)=>{
    if(err){
        return res.status(500).json({erro:err.message})
    }
    res.json({todo: row})
   })
})

app.post('/todos',(req,res)=>{
    const {title} = req.body
    const query = ' INSERT INTO todos (name,age) VALUES (?,?)'
    db.run(query,[title], function(err){
      if(err){
        return res.status(500).json({error:err.message})
      }
      res.status(200).json({id:this.lastID})
    })
})

app.put('/todos/:id', (req,res)=>{
    const {id} = req.params
    const {title,completed} = req.body
    const query = `UPDATE todos SET
    title = ?, completed = ? WHERE id = ?`
    db.run(query,[title,completed,id],function(err){
        if(err){
            return res.status(400).json({error:err.message})
        }
        res.json({updated: this.changes})
    })
})

app.delete('/todos/:id',(req,res)=>{
    const {id} = req.params;
    db.run('DELETE FROM todos WHERE id = ?', [id], function(err){
        if(err){
            return res.status(500).json({error:err.message})
        }
        if(this.changes === 0) {
            return res.status(404).json({error: 'Tode not found'})
        }
    })
    res.json({deleted:this.changes})
})


const port = 5002

app.listen(port,()=>{
    console.log(`Server is runing on ${port}`)
})

