import express from 'express'

const router = express.Router()

router.get('/health', (request, response) => {
  response.sendStatus(200).send('All Goods ✅')
})


export default router