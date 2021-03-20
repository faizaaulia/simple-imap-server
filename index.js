import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import imaps from 'imap-simple'

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(cors())

app.post('/mail', (req, res) => {
  var config = {
    imap: {
        user: req.body.email,
        password: req.body.password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 3000
    }
  };

  imaps.connect(config, (err, connection) => {
    try {
      return connection.openBox('INBOX', (error, mailbox) => {
        let searchCriteria = ['1:10']
        let fetchOpt = {
          bodies: ['HEADER', 'TEXT'],
          markseen: false
        }
        return connection.search(searchCriteria, fetchOpt, (err, results) => {
          let mails = []
          results.map((val) => {
            let header = val.parts.filter((part) => {
              return part.which == 'HEADER'
            })[0].body

            mails.push({
              messageId: header['message-id'][0],
              subject: header.subject[0],
              from: header.from[0],
              date: header.date[0],
            })
          })

          res.json(mails)
        })
      })
    } catch (err) {
      if (err) res.json('error')
    }
  })
})

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`)
})