const process = require('process')
const crypto = require('crypto')
const ascii = require('ascii-table')
const prompt = require('prompt-sync')()
const secureRandom = require('secure-random')
const players = [];
//4 classes - help table, winning logic, key generation, menu
class HelpTable{
  constructor(players)
  {
     this.players = players
     
  }
  draw()
  {
     var head = ['PC | User >'] 
     for (let i = 0; i <= this.players.length; i++)
     {
       head.push(this.players[i])
     }
     var rows = []

     for (let k = 0; k < this.players.length; k++)
      {
        var row = []
        var score = []
        for (let l = 0; l < this.players.length; l++)
          {
            if (l == 0)
            {
              row[l] = this.players[k]
            }
            
            if (k == l)
            {
              row[l + 1] = "Draw"
            }
            else if(l > k && l - k <= (this.players.length - 1)/2)
            {
              row[l + 1] = "Win"
            }
            else if ((l < k && k - l <= (this.players.length - 1)/2) || (l > k && l - k > (this.players.length - 1)/2))
            {
              row[l + 1] = "Lose"
            }
            else
            {
              row[l + 1] = "Win"
            }
          }
        rows.push(row)
      }
      var table = ascii.factory({
          title: 'Help Table',
          heading: head,
          rows: rows
        })
    return table.toString()
  }
}

class Rules{
  constructor(players){
    this.players = players
  }
  check(pc, user)
  {
    var scores = []
    for (let k = 0; k < this.players.length; k++)
      {
        var score = []
        for (let l = 0; l < this.players.length; l++)
          {
            if (k == l)
            {
              score[l] = "Draw"
            }
            else if (l > k && l - k <= (this.players.length - 1)/2)
            {
              score[l] = "Win"
            }
            else if ((l < k && k - l <= (this.players.length - 1)/2) || (l > k && l - k > (this.players.length - 1)/2))
            {
              score[l] = "Lose"
            }
            else
            {
              score[l] = "Win"
            }
          }
        scores.push(score)
      }
    return scores[pc][user]
  }
    
}

class HmacGen{
  constructor(move)
  {
    this.move = move
  }
  show()
  {
    var key = secureRandom.randomBuffer(32)
    var hmac = crypto.createHmac('sha256', key).update(this.move).digest("hex")
    return hmac.toUpperCase()
  }
}

class Menu{
  constructor(players)
  {
    this.players = players
  }
  show()
  {
    console.log("Available moves:")
    for (let i = 0; i < this.players.length; i++)
      {
        console.log(`${i + 1} - ${this.players[i]}`)
      }
    console.log("0 - exit")
    console.log("? - help")
  }
}

function gameLoop(players)
{
    var active = true
    var validInputs = ['0','?']
    for (let m = 1; m <= players.length; m++)
     {
        validInputs.push(m.toString())
     }
    
    while (active)
    {
       const menu = new Menu(players)
       menu.show()
       var usersMove = prompt("Enter your move: ")
      
       if (validInputs.includes(usersMove))
       {
          if (usersMove == '0')
          {
            active = false
            break
          }
          else if (usersMove == '?')
          {
            var table = new HelpTable(players)
            console.log(table.draw())
            continue
          }
          else
          {
            console.log(`Your move: ${players[usersMove - 1]}`)
            console.log(`PC's move: ${players[pcMove]}`)
            const rule = new Rules(players)
            console.log(rule.check(pcMove, usersMove - 1))
            var hmacUser = new HmacGen((usersMove - 1).toString())
            console.log(`HMAC: ${hmacUser.show()}`)
            active = false
          }
       }
           
    }
  }

if (process.argv.length < 5 || process.argv.length % 2 == 0)
{
  //Change to error messages later with examples
  console.log('The number of players should be odd and greater than 3. Ex: node script.js 1 2 3')
}
else
{
  for (let i = 2; i < process.argv.length; i++)
  {
    if (players.includes(process.argv[i]))
    {
      //Change to error messages later
      console.log('The players should not repeat. Ex: node script.js 1 2 3')
      break
    }
    else
    {
      players.push(process.argv[i])
    }
      
  }

  const playerSet = new Set(players);
  
  if (playerSet.size >= 3 && players.length == playerSet.size)
  {
     var pcMove = crypto.randomInt(0, players.length)
     var hmacPC = new HmacGen(pcMove.toString())
     console.log(`HMAC: ${hmacPC.show()}`)
     gameLoop(players)
       
  }

}
