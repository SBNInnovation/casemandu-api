const slugify = require('slugify')

const createSLUG = async (model, title) => {
  let slug = slugify(title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  })

  const exists = await model.findOne({ slug })

  if (exists) {
    const randomString = Math.random().toString(36).substring(2, 8)
    slug = `${slug}-${randomString}`
  }
  return slug
}

module.exports = createSLUG
