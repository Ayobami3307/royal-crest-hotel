// Every photograph used on the public site lives here, so swapping in the hotel's own photography is a one-file job.
// These are royalty-free Unsplash images. Replace them with licensed photography of the actual property before launch.

export const photo = (id, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  hero: [
    'photo-1566073771259-6a8506099945',
    'photo-1542314831-068cd1dbfeeb',
    'photo-1551882547-ff40c63fe5fa',
  ],
  exterior: 'photo-1564501049412-61c2a3083791',
  lobby: 'photo-1542314831-068cd1dbfeeb',
  pool: 'photo-1571896349842-33c89424de2d',
  poolWide: 'photo-1520250497591-112f2f40a3f4',
  restaurant: 'photo-1517248135467-4c7edcad34c4',
  dining: 'photo-1414235077428-338989a2e8c0',
  diningRoom: 'photo-1559339352-11d035aa65de',
  bar: 'photo-1551632436-cbf8dd35adfa',
  spa: 'photo-1540555700478-4be289fbecef',
  massage: 'photo-1544161515-4ab6ce6db874',
  gym: 'photo-1534438327276-14e5300c3a48',
  gym2: 'photo-1571902943202-507ec2618e8f',
  hall: 'photo-1519167758481-83f550bb49b3',
  conference: 'photo-1505373877841-8d25f7d46678',
  room1: 'photo-1631049307264-da0ec9d70304',
  room2: 'photo-1618773928121-c32242e63f39',
  room3: 'photo-1595576508898-0ad5c879a061',
  room4: 'photo-1512918728675-ed5a9ecdebfd',
  bath: 'photo-1578683010236-d716f9a3f461',
  suite: 'photo-1560448204-e02f11c3d0e2',
};
