import { Router } from 'express';
import { getFriends, 
    getFriendRequests, 
    sendFriendRequest, 
    acceptFriendRequest,  
    rejectFriendRequest, 
    cancelFriendRequest, 
    unfriend,
    getFriendsInfo
 } from '../controllers/friend.controller.js';

const router = Router();

router.get("/friends", getFriends);
router.get('/friends-info', getFriendsInfo);
router.get("/friends/requests", getFriendRequests);
router.post("/friends/:friendId", sendFriendRequest);
router.patch("/friends/:requesterId", acceptFriendRequest);
router.delete("/friends/reject/:requesterId", rejectFriendRequest);
router.delete("/friends/cancel/:friendId", cancelFriendRequest);
router.delete("/friends/:friendId", unfriend);

export default router;