import express from 'express'

const router = express.Router()

router.get('/health', (request, response) => {
  console.log('Everything is working')
  response.status(200).send('All Goods ✅')
})


export default router