const express = require('express')
const router = express.Router();
const Candidate = require('./../model/candidate');
const User = require('./../model/user');
const { jwtAuthmiddleware, generatetoken } = require('./../jwt')

const checkAdminRole = async(userId) => {
    try {
        const user = await User.findById(userId);
        // console.log(user.role == "admin")
        return user.role === "admin" ? true : false;

    } catch (error) {
        return false;
    }

}

router.post('/', jwtAuthmiddleware, async(req, res) => {
    try {

        if (!(await checkAdminRole(req.user.userData.id))) {
            return res.status(403).json({ message: "not a admin" })
        }
        const data = req.body;
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        console.log('data saved');



        res.status(200).json({ response: response });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal server errorgg" })
    }
})

//update password
router.put('/:candidateId', jwtAuthmiddleware, async(req, res) => {
    try {
        if (!(await checkAdminRole(req.user.userData.id))) {
            return res.status(403).json({ message: "not a admin" })
        }
        const candidateId = req.params.candidateId; // extrect the email
        const updateCandidatedata = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidatedata, {
            new: true, //return the update document 
            runValidators: true // validtae the person field
        })

        if (!response) {
            res.status(400).json({ error: " Candidate data not found" });
        }
        console.log(" Candidate data updated")
        res.status(200).json(response)

    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "internal error" })

    }
})

router.delete('/:candidateId', jwtAuthmiddleware, async(req, res) => {
    try {
        if (!(await checkAdminRole(req.user.userData.id))) {
            return res.status(403).json({ message: "not a admin" })
        }
        const candidateId = req.params.candidateId; // extrect the email

        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            res.status(400).json({ error: " Candidate data not found" });
        }
        console.log(" Candidate data deleted")
        res.status(200).json(response)

    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "internal error" })

    }
})

router.post('/vote/:candidateId', jwtAuthmiddleware, async(req, res) => {
    try {
        const candidateId = req.params.candidateId;
        const userId = req.user.userData.id;

        const candidate = await Candidate.findById(candidateId);
        if (!candidateId) {
            res.status(404).json({ error: "Candidate not found" })
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "user not found" })
        }
        if (user.isVoted) {
            res.status(404).json({ error: "you already voted" })
        }
        if (!user.role == 'admin') {
            res.status(404).json({ error: "admin can't vote" })
        }
        //update th candidate
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        //user update
        user.isVoted = true;
        await user.save();

        res.status(200).json({ message: "vote submitted successfully" })
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "internal error" })
    }
})

router.get('/vote/count', async(req, res) => {
    try {
        const candidate = await Candidate.find();
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                vote: data.voteCount
            }
        })
        res.status(200).json(voteRecord)
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "internal error" })
    }
})
router.get('/candidatelist', async(req, res) => {

    try {
        const candidate = await Candidate.find();
        const candidatelist = candidate.map((data) => {
            return {
                candidate: data.name,
                party: data.party
            }
        })
        res.status(200).json(candidatelist);
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "internal error" })
    }
})


module.exports = router;