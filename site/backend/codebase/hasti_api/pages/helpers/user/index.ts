import type { JWTBodyRequest } from "@/interfaces/user/requests";
import prisma from "@/prisma/client";
import { User } from "@prisma/client";
import crypto from 'crypto';

const algorithm = 'aes-256-ctr';
const ENCRYPTION_KEY = 'Put_Your_Password_Here'; // or generate sample key Buffer.from('FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs=', 'base64');
const IV_LENGTH = 16;

export async function addOrUpdateUser(user: JWTBodyRequest): Promise<User|null> {
  // Add user to database
  const userExists = await prisma.user.findUnique({
    where: {
      githubID: user.user.id
    }
  })

  // Already exists.
  if(userExists){

    // check if image has changed
    if(userExists.image !== user.user.avatar){

      const updatedUser = await prisma.user.update({
        where: {
          githubID: user.user.id
        },
        data: {
          image: user.user.avatar
        }
      })
    }

    return userExists
  }

  // Else if user does not exist, create a new user
  try{
    const newUser = await prisma.user.create({
      data: {
        githubID: user.user.id,
        username: user.user.username,
        image: user.user.avatar
      }
    })
    return newUser
  
  }catch(e){
    return null
  }
}


export async function updateGitHubUserToken(token:string, user: User){
  const encryptedToken = encrypt(token)
  console.log('token', token)
  console.log('encryptedToken', encryptedToken)
  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      ghuToken: encryptedToken
    }
  })

  return true
}





function encrypt(text:string) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text:string) {
  let textParts = text.split(':');
  let shifted = textParts.shift();
  if (!shifted) {
    throw new Error('Invalid text input');
  }
  let iv = Buffer.from(shifted, 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}