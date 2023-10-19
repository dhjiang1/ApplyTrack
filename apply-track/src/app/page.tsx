import Image from 'next/image'
import { Revalia } from 'next/font/google';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import * as path from 'path';
import { filterStatus, filterPos } from '../files/filter_list';
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
                    "from": parsed.from.value,
                    "date": parsed.date,
                    "subject": parsed.subject,
                    "text": parsed.text
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

  function readCsv(filename: string) {
    type Applications = {
      company: string;
      position: string;
      app_date: Date;
      status: string;
    }

    const csvFilePath = path.resolve(__dirname, 'files/${filename}.csv');

    const headers = ['company_name', 'position', 'date_last_updated', 'status'];

    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    parse(fileContent, {
      delimiter: ',',
      columns: headers,
    }, (error, result: Applications[]) => {
      if (error) {
        console.error(error);
      }
      console.log("Result", result);
      return result
    });

  }

  function formatCsv(readData: [], data: [], filename: string, filter) {
    // process data from scrapeEmail
    var updated_data = []

    data.forEach(entry => {
      if (entry["from"] != "Indeed"){
         const temp = {
           "company": determineCompany(entry),
           "position": determinePos(entry),
           "app_date": entry["date"],
           "status": determineStatus(entry, filter)
         }

         updated_data.push(temp)
      }

    })

    // list of all names already in the csv
    var ind = 0
    var companies = []
    readData.forEach(application => {
      companies.push(application["company_name"])
    })

    // update entries in csv file
    /* if company name already in readData
          update date and status columns based on the above processed data
        else
          add it to the readData variable
    
    once above two done, descending order the readData var
    write readData to the given file name
    */

  }

  function determineCompany(entry: {}) {
    // if sender is a no-reply type email
    if (entry["from"].address.contains("no-reply")) {
      // if subject contains "to"
      if (entry["subject"].contains("to")) {
        // return the substring after the space after to
        return entry["subject"].split("to ")[1]
      }
      // else:
      else {
        // return substring after the "your" and until "application"
        return entry["subject"].split("your ")[1].split(" application")[0]
      }
    }

    // if sender is not a no-reply email
    else {
      // if value.name is not empty
      if (entry["from"].name) {
        // return the name
        return entry["from"].name 
      }

      // if value.name is empty
      else {
        // return the address it is from
        return entry["from"].address
      }
    }

  }

  function determinePos(entry: {}) {
    // have it end either at Engineer (for software engineer) or Manager (for Product Manager)
    
  }

  function determineStatus(entry: {}, filter) {
    Object.keys(filter).forEach(key => {
      filter[key].forEach(filt => {
        if (entry["text"].contains(filt)) {
          return key
        }
      })
    })
  }
  

  // pass is using app password via the google 2 step verification setup
  return (
    <main>
      {ScrapeEmail('darren.jiang135@gmail.com', 'bfhf pvtr yqyw tkmy')}
      {readCsv('apply_track')}
    </main>
  )
}
