import Image from 'next/image'
import { Revalia } from 'next/font/google';
/** import variable with email and password */

export default function Home() {

  function ScrapeEmail(email: string, pass: string) {
    const mailparser = require('mailparser')
    const simpleParser = require('mailparser').simpleParser
    const Imap = require('imap')
    const imapConfig = {
      user: email,
      password: pass,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false,
      }
    }

    var data = []
  
    try {
      const imap = new Imap(imapConfig);
      imap.once('ready', () => {
        imap.openBox('INBOX', false, () => {
          imap.search(['ALL', ['SINCE', new Date()]], (err, results) => {
            const f = imap.fetch(results, {bodies: ''});
            f.on('message', msg => {
              msg.on('body', stream => {
                simpleParser(stream, async (err, parsed) => {
                  // const {from, subject, textAsHtml, text} = parsed;
                  // return only necessary values
                  const dict = {
                    date: parsed.date,
                    text: parsed.text
                  }
                  
                  data.push(dict)
                });
              });
              msg.once('attributes', attrs => {
                const {uid} = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                  // Mark the email as read after reading it
                  console.log('Marked as read!');
                });
              });
            });
            f.once('error', ex => {
              return Promise.reject(ex);
            });
            f.once('end', () => {
              console.log('Done fetching all messages!');
              imap.end();
            });
          });
        });
      });
  
      imap.once('error', err => {
        console.log(err);
      });
  
      imap.once('end', () => {
        console.log('Connection ended');
        // testing
        // console.log(data)
        // console.log(data.length)
        return data;
      });
  
      imap.connect();
    } catch (ex) {
      console.log('an error occurred');
    }
  }

  function formatCSV(data) {

    //
  }

  // pass is using app password via the google 2 step verification setup
  return (
    <main>
      {ScrapeEmail('darren.jiang135@gmail.com', 'bfhf pvtr yqyw tkmy')}
    </main>
  )
}
