

const err404 = async(req, res, next) => {
    res.status(404);
    res.render("404", { url: req.url });
}


const err500 = async(err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).render('500')
}


module.exports = {
    err404,
    err500
}
