const express = require('express')
const path = require('path')
const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend')))

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get('/inventory', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/Inventory.html'))
})
 
app.listen(1234, () => {
  console.log('Server is running on http://localhost:1234')
})