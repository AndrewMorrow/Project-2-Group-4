const router = require("express").Router();
const { User } = require("../../models");

// route: /api/user/
router.post("/", async (req, res) => {
    try {
        // console.log(req.body);
        const dbUserData = await User.create(req.body);
        req.session.save(() => {
            req.session.id = dbUserData.id;
            req.session.logged_in = true;
            res.status(200).json(dbUserData);
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

// route: api/user/login
router.post("/login", async (req, res) => {
    try {
        const userData = await User.findOne({
            where: { email: req.body.email },
        });

        if (!userData) {
            res.status(400).json({
                message: "Incorrect email or password, please try again",
            });
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);

        if (!validPassword) {
            res.status(400).json({
                message: "Incorrect email or password, please try again",
            });
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;

            res.json({ user: userData, message: "You are now logged in!" });
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

// route: api/user/logout
router.post("/logout", (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;
