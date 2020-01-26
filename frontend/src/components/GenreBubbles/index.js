import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';

class GenreBubbles extends Component {
  componentDidMount() {
    let oWidth = document.getElementById('graphContainer').offsetWidth;
    if (this.props.search !== false) {
      this.drawGenreBubbles(oWidth);
    }
  }

  drawGenreBubbles(oWidth) {
    let root = {
      name: 'genres',
      children: [
        {
          name: 'Television_program',
          children: [
            {
              name: 'kendrick lamar',
              children: [
                {
                  name:
                    'Kendrick Lamar - These Walls (Live on Ellen) ft. Bilal, Anna Wise, Thundercat',
                  size: 104083,
                },
              ],
            },
            {
              name: 'hollywood undead',
              children: [
                { name: 'Hollywood Undead - Dead Bite', size: 200006 },
              ],
            },
            {
              name: 'bleachers',
              children: [
                { name: 'Bleachers - I Wanna Get Better', size: 210765 },
              ],
            },
            {
              name: 'toby keith',
              children: [{ name: 'Toby Keith - Getcha Some', size: 17101 }],
            },
            {
              name: 'jennifer lopez',
              children: [
                {
                  name:
                    'Jennifer Lopez - I Luh Ya Papi (Explicit) ft. French Montana',
                  size: 274373,
                },
              ],
            },
          ],
        },
        // { name: 'Performing_arts', children: [] },
        {
          name: 'Jazz',
          children: [
            {
              name: 'sade',
              children: [
                {
                  name: 'Sade - Smooth Operator (Official Video)',
                  size: 1286781,
                },
                { name: 'Sade - Kiss Of Life (Official Video)', size: 745345 },
                {
                  name: 'Sade - Your Love Is King (Official Video)',
                  size: 693237,
                },
              ],
            },
            {
              name: 'tony bennett',
              children: [
                {
                  name:
                    'Tony Bennett, Lady Gaga - The Lady is a Tramp (from Duets II: The Great Performances)',
                  size: 436443,
                },
                {
                  name:
                    'Tony Bennett, Sheryl Crow - The Girl I Love (from Duets II: The Great Performances)',
                  size: 97645,
                },
                {
                  name: 'Tony Bennett - For Once in My Life (from Viva Duets)',
                  size: 89441,
                },
              ],
            },
            {
              name: 'kenny g',
              children: [
                {
                  name: 'Kenny G - The Moment (Official Video)',
                  size: 2214128,
                },
                { name: 'Kenny G - Forever In Love', size: 665388 },
                { name: 'Kenny G - Songbird', size: 591896 },
              ],
            },
            {
              name: 'miles davis',
              children: [
                { name: 'Miles Davis - So What', size: 632848 },
                { name: 'Miles Davis - Milestones (Audio)', size: 66208 },
                { name: 'Miles Davis - Burn', size: 41251 },
              ],
            },
            {
              name: 'jamie cullum',
              children: [
                { name: "Jamie Cullum - Don't Stop the Music", size: 109033 },
                { name: 'Jamie Cullum - Everlasting Love', size: 72364 },
                { name: 'Jamie Cullum - Mind Trick', size: 54629 },
              ],
            },
          ],
        },
        {
          name: 'Reggae',
          children: [
            {
              name: 'ub40',
              children: [
                { name: 'UB40 - Kingston Town', size: 1223374 },
                { name: 'UB40 - Higher Ground', size: 616076 },
                { name: 'UB40 - Impossible Love', size: 444834 },
              ],
            },
            {
              name: 'matisyahu',
              children: [
                {
                  name: "Matisyahu - King Without A Crown (Live from Stubb's)",
                  size: 1147996,
                },
                { name: 'Matisyahu - Sunshine', size: 611354 },
                { name: 'Matisyahu - King Without A Crown', size: 531646 },
              ],
            },
            {
              name: 'snoop lion',
              children: [
                {
                  name: 'Snoop Lion - Here Comes the King ft. Angela Hunte',
                  size: 334967,
                },
                {
                  name: 'Snoop Lion - Lighters Up ft. Mavado, Popcaan',
                  size: 285546,
                },
                {
                  name: 'Snoop Lion - Ashtrays and Heartbreaks ft. Miley Cyrus',
                  size: 68490,
                },
              ],
            },
            {
              name: 'rihanna',
              children: [
                { name: 'Rihanna - Man Down', size: 13469950 },
                { name: 'Rihanna - Work (Explicit) ft. Drake', size: 7775330 },
                { name: 'Rihanna - Rude Boy', size: 6086198 },
              ],
            },
            {
              name: 'r kelly',
              children: [
                { name: 'R. Kelly - Thoia Thoing', size: 438446 },
                { name: 'R. Kelly - Snake', size: 170770 },
                {
                  name: 'R. Kelly - Snake (Remix) ft. Big Tigger',
                  size: 25975,
                },
              ],
            },
          ],
        },
        {
          name: 'Independent_music',
          children: [
            {
              name: 'manic street preachers',
              children: [
                {
                  name:
                    'Manic Street Preachers - If You Tolerate This Your Children Will Be Next',
                  size: 363229,
                },
                {
                  name: 'Manic Street Preachers - A Design For Life',
                  size: 144069,
                },
                {
                  name:
                    'Manic Street Preachers - You Stole the Sun from My Heart (Video)',
                  size: 97236,
                },
              ],
            },
            {
              name: 'oasis',
              children: [
                { name: 'Oasis - Wonderwall', size: 28179752 },
                { name: 'Oasis - Stop Crying Your Heart Out', size: 5800967 },
                { name: 'Oasis - Stand By Me', size: 5424103 },
              ],
            },
            {
              name: 'florence and the machine',
              children: [
                {
                  name:
                    'Florence + The Machine - Dog Days Are Over (2010 Version)',
                  size: 4549751,
                },
                {
                  name: 'Florence + The Machine - Shake It Out',
                  size: 2451429,
                },
                {
                  name: "Florence + The Machine - You've Got the Love",
                  size: 1555961,
                },
              ],
            },
            {
              name: 'kasabian',
              children: [
                { name: 'Kasabian - Fire (Video)', size: 458571 },
                { name: 'Kasabian - Goodbye Kiss', size: 293533 },
                { name: 'Kasabian - L.S.F.', size: 247847 },
              ],
            },
            {
              name: 'the stone roses',
              children: [
                { name: 'The Stone Roses - I Wanna Be Adored', size: 1483887 },
                { name: 'The Stone Roses - Beautiful Thing', size: 49822 },
                { name: 'The Stone Roses - Ten Storey Love Song', size: 45230 },
              ],
            },
            {
              name: 'nothing but thieves',
              children: [
                {
                  name: 'Nothing But Thieves - Wake Up Call (Official Video)',
                  size: 310277,
                },
                {
                  name: 'Nothing But Thieves - Graveyard Whistling',
                  size: 308570,
                },
                {
                  name: 'Nothing But Thieves - Trip Switch (Official Video)',
                  size: 215618,
                },
              ],
            },
            {
              name: 'the cure',
              children: [
                { name: "The Cure - Friday I'm In Love", size: 2738711 },
                { name: 'The Cure - Just Like Heaven', size: 2480106 },
                { name: "The Cure - Boys Don't Cry", size: 2276503 },
              ],
            },
            {
              name: 'we the kings',
              children: [
                {
                  name: 'We The Kings - Sad Song (Lyric Video) ft. Elena Coats',
                  size: 13969872,
                },
                {
                  name: 'We The Kings - See You In My Dreams (Lyric Video)',
                  size: 70560,
                },
                { name: 'We The Kings - Skyway Avenue', size: 40158 },
              ],
            },
            {
              name: 'bastille',
              children: [
                { name: 'Bastille - Pompeii', size: 14268065 },
                { name: 'Bastille - Of The Night', size: 571105 },
                { name: 'Bastille - Things We Lost In The Fire', size: 537414 },
              ],
            },
            {
              name: 'the neighbourhood',
              children: [
                {
                  name: 'The Neighbourhood - Sweater Weather (Video)',
                  size: 11256579,
                },
                {
                  name: 'The Neighbourhood - The Beach (Audio)',
                  size: 1788637,
                },
                {
                  name: 'The Neighbourhood - Daddy Issues (Video)',
                  size: 1061093,
                },
              ],
            },
            {
              name: 'pj harvey',
              children: [
                { name: 'PJ Harvey - This Is Love', size: 210527 },
                { name: 'PJ Harvey - Good Fortune', size: 107510 },
                { name: 'PJ Harvey - The Wheel', size: 75663 },
              ],
            },
            {
              name: 'american authors',
              children: [
                {
                  name: 'American Authors - Best Day Of My Life',
                  size: 2832601,
                },
                {
                  name: 'American Authors - What We Live For (Lyric Video)',
                  size: 150651,
                },
                { name: 'American Authors - Hit It (Audio)', size: 144439 },
              ],
            },
            {
              name: 'the airborne toxic event',
              children: [
                {
                  name: 'The Airborne Toxic Event - Sometime Around Midnight',
                  size: 454899,
                },
                { name: 'The Airborne Toxic Event - Changing', size: 57743 },
                { name: 'The Airborne Toxic Event - Numb', size: 30248 },
              ],
            },
            {
              name: 'halsey',
              children: [
                { name: 'Halsey - Colors', size: 6019858 },
                { name: 'Halsey - Gasoline (Audio)', size: 2317250 },
                { name: 'Halsey - Control (Audio)', size: 1847523 },
              ],
            },
          ],
        },
        {
          name: 'Music_of_Asia',
          children: [
            {
              name: 'shania twain',
              children: [
                {
                  name:
                    "Shania Twain - I'm Gonna Getcha Good! (All Performance Version)",
                  size: 1714419,
                },
                {
                  name:
                    "Shania Twain - I'm Gonna Getcha Good! (Red Picture Version)",
                  size: 1094466,
                },
                { name: 'Shania Twain - When You Kiss Me', size: 818307 },
              ],
            },
            { name: 'd12', children: [{ name: 'D12 - 40 Oz.', size: 144386 }] },
            {
              name: 'connie talbot',
              children: [{ name: 'Connie Talbot - Fireflies', size: 30245 }],
            },
            {
              name: 'westlife',
              children: [
                {
                  name: 'Westlife - Fool Again (Official Video)',
                  size: 3672813,
                },
                {
                  name: 'Westlife - Fool Again (Live From M.E.N. Arena)',
                  size: 57399,
                },
                {
                  name:
                    'Westlife - Fool Again (Where Dreams Come True - Live In Dublin)',
                  size: 31067,
                },
              ],
            },
          ],
        },
        // { name: 'Entertainment', children: [] },
        {
          name: 'Christian_music',
          children: [
            {
              name: 'chris tomlin',
              children: [
                {
                  name: 'Chris Tomlin - Good Good Father (Audio)',
                  size: 6477476,
                },
                { name: 'Chris Tomlin - Our God (Live)', size: 1798308 },
                {
                  name:
                    'Chris Tomlin - Whom Shall I Fear [God of Angel Armies] [Lyrics]',
                  size: 892714,
                },
              ],
            },
            {
              name: 'michael w smith',
              children: [
                { name: 'Michael W. Smith - A New Hallelujah', size: 424544 },
                { name: 'Michael W. Smith - Healing Rain', size: 120744 },
                {
                  name: 'Michael W. Smith - Sovereign Over Us (Live)',
                  size: 100675,
                },
              ],
            },
            {
              name: 'kari jobe',
              children: [
                { name: 'Kari Jobe - I Am Not Alone (Live)', size: 1017285 },
                {
                  name: 'Kari Jobe - Holy Spirit (Live) ft. Cody Carnes',
                  size: 440921,
                },
                { name: 'Kari Jobe - Steady My Heart', size: 191803 },
              ],
            },
            {
              name: 'amy grant',
              children: [
                { name: 'Amy Grant - Baby, Baby', size: 232719 },
                {
                  name:
                    'Amy Grant - I Will Remember You (Official Music Video)',
                  size: 147778,
                },
                {
                  name:
                    'Amy Grant - Better Than A Hallelujah (Official Music Video)',
                  size: 86114,
                },
              ],
            },
            {
              name: 'tobymac',
              children: [
                { name: 'TobyMac - Speak Life', size: 1409483 },
                {
                  name: 'TobyMac - Lights Shine Bright ft. Hollyn',
                  size: 1301999,
                },
                {
                  name: 'TobyMac - Me Without You (Official Lyric Video)',
                  size: 870630,
                },
              ],
            },
          ],
        },
        // { name: 'Film', children: [] },
        {
          name: 'Country_music',
          children: [
            {
              name: 'alan jackson',
              children: [
                { name: 'Alan Jackson - Remember When', size: 7664406 },
                { name: 'Alan Jackson - Chattahoochee', size: 4742829 },
                { name: "Alan Jackson - Livin' On Love", size: 4286250 },
              ],
            },
            {
              name: 'reba mcentire',
              children: [
                { name: 'Reba McEntire - Fancy', size: 1371018 },
                { name: 'Reba McEntire - Consider Me Gone', size: 711734 },
                {
                  name: 'Reba McEntire - Does He Love You ft. Linda Davis',
                  size: 427376,
                },
              ],
            },
            {
              name: 'toby keith',
              children: [
                { name: 'Toby Keith - I Love This Bar', size: 1525747 },
                {
                  name: 'Toby Keith - How Do You Like Me Now?!',
                  size: 1437966,
                },
                { name: 'Toby Keith - American Soldier', size: 1326022 },
              ],
            },
            {
              name: 'kenny chesney',
              children: [
                { name: "Kenny Chesney - Don't Blink", size: 1216393 },
                { name: 'Kenny Chesney - There Goes My Life', size: 1031367 },
                { name: 'Kenny Chesney - American Kids', size: 905278 },
              ],
            },
            {
              name: 'brad paisley',
              children: [
                {
                  name:
                    'Brad Paisley - Whiskey Lullaby (featurning Alison Krauss)',
                  size: 4278941,
                },
                {
                  name: 'Brad Paisley - Remind Me  ft. Carrie Underwood',
                  size: 3462381,
                },
                { name: "Brad Paisley - She's Everything", size: 2012990 },
              ],
            },
            {
              name: 'jake owen',
              children: [
                { name: 'Jake Owen - Barefoot Blue Jean Night', size: 306517 },
                { name: 'Jake Owen - Eight Second Ride', size: 256935 },
                {
                  name: 'Jake Owen - American Country Love Song',
                  size: 252012,
                },
              ],
            },
            {
              name: 'rascal flatts',
              children: [
                { name: 'Rascal Flatts - What Hurts The Most', size: 4121319 },
                { name: 'Rascal Flatts - Here Comes Goodbye', size: 762745 },
                { name: 'Rascal Flatts - Bless The Broken Road', size: 568555 },
              ],
            },
          ],
        },
        {
          name: 'Rock_music',
          children: [
            {
              name: 'ac dc',
              children: [
                {
                  name: 'AC/DC - Back In Black (Official Video)',
                  size: 26682133,
                },
                {
                  name: 'AC/DC - Thunderstruck (Official Video)',
                  size: 22982468,
                },
                {
                  name: 'AC/DC - Highway to Hell (Official Video)',
                  size: 11394059,
                },
              ],
            },
            {
              name: 'billy joel',
              children: [
                { name: 'Billy Joel - Piano Man (Video)', size: 3669551 },
                {
                  name:
                    "Billy Joel - We Didn't Start the Fire (Official Video)",
                  size: 1942468,
                },
                {
                  name: 'Billy Joel - A Matter of Trust (Official Video)',
                  size: 664691,
                },
              ],
            },
            {
              name: 'bon jovi',
              children: [
                { name: "Bon Jovi - It's My Life", size: 29621060 },
                { name: "Bon Jovi - Livin' On A Prayer", size: 25015383 },
                { name: 'Bon Jovi - Always', size: 14230592 },
              ],
            },
            {
              name: 'incubus',
              children: [
                { name: 'Incubus - Drive', size: 5122913 },
                { name: 'Incubus - Wish You Were Here', size: 1986302 },
                { name: 'Incubus - Pardon Me', size: 1187865 },
              ],
            },
            {
              name: 'aerosmith',
              children: [
                {
                  name: "Aerosmith - I Don't Want to Miss a Thing (Video)",
                  size: 28917720,
                },
                { name: 'Aerosmith - Crazy', size: 9515330 },
                { name: "Aerosmith - Cryin'", size: 3626817 },
              ],
            },
            {
              name: 'judas priest',
              children: [
                { name: 'Judas Priest - Painkiller', size: 1919976 },
                { name: 'Judas Priest - Breaking The Law', size: 1398083 },
                {
                  name: 'Judas Priest - Turbo Lover (Official Video)',
                  size: 1116617,
                },
              ],
            },
            {
              name: 'electric light orchestra',
              children: [
                {
                  name: 'Electric Light Orchestra - Mr. Blue Sky',
                  size: 1455579,
                },
                {
                  name: 'Electric Light Orchestra - Telephone Line (Audio)',
                  size: 541433,
                },
                {
                  name:
                    "Electric Light Orchestra - Sweet Talkin' Woman (Audio)",
                  size: 442192,
                },
              ],
            },
            {
              name: 'bruce springsteen',
              children: [
                {
                  name: 'Bruce Springsteen - Dancing In the Dark',
                  size: 5062831,
                },
                {
                  name: 'Bruce Springsteen - Streets of Philadelphia',
                  size: 4939226,
                },
                {
                  name: 'Bruce Springsteen - Tougher Than the Rest',
                  size: 3078914,
                },
              ],
            },
            {
              name: 'the byrds',
              children: [
                {
                  name: "The Byrds - I'll Feel A Whole Lot Better (Audio)",
                  size: 30794,
                },
                {
                  name:
                    'The Byrds - Turn! Turn! Turn! (To Everything There Is A Season) (Audio)',
                  size: 30325,
                },
                { name: 'The Byrds - Mr. Tambourine Man (Audio)', size: 16585 },
              ],
            },
            {
              name: 'the killers',
              children: [
                { name: 'The Killers - Mr. Brightside', size: 12430764 },
                { name: 'The Killers - Somebody Told Me', size: 5485128 },
                { name: 'The Killers - Shot At The Night', size: 3046376 },
              ],
            },
            {
              name: 'foo fighters',
              children: [
                { name: 'Foo Fighters - The Pretender', size: 16796467 },
                { name: 'Foo Fighters - Best Of You (VIDEO)', size: 4096643 },
                { name: 'Foo Fighters - Everlong', size: 3357406 },
              ],
            },
            {
              name: 'fall out boy',
              children: [
                {
                  name: 'Fall Out Boy - Centuries (Official Video)',
                  size: 6951850,
                },
                {
                  name:
                    "Fall Out Boy - Sugar, We're Goin Down (Concept Version)",
                  size: 3539616,
                },
                { name: 'Fall Out Boy - Dance, Dance', size: 3330518 },
              ],
            },
            {
              name: 'kasabian',
              children: [
                { name: 'Kasabian - Fire (Video)', size: 458571 },
                { name: 'Kasabian - Club Foot', size: 303996 },
                { name: 'Kasabian - Goodbye Kiss', size: 293533 },
              ],
            },
            {
              name: 'manic street preachers',
              children: [
                {
                  name: 'Manic Street Preachers - Motorcycle Emptiness',
                  size: 396886,
                },
                {
                  name:
                    'Manic Street Preachers - If You Tolerate This Your Children Will Be Next',
                  size: 363229,
                },
                {
                  name: 'Manic Street Preachers - A Design For Life',
                  size: 144069,
                },
              ],
            },
            {
              name: 'nirvana',
              children: [
                { name: 'Nirvana - Smells Like Teen Spirit', size: 42773483 },
                {
                  name: 'Nirvana - The Man Who Sold The World (MTV Unplugged)',
                  size: 11601202,
                },
                { name: 'Nirvana - Come As You Are', size: 8673336 },
              ],
            },
            {
              name: 'u2',
              children: [
                { name: 'U2 - Beautiful Day', size: 2309993 },
                { name: 'U2 - Pride (In The Name Of Love)', size: 2157191 },
                { name: 'U2 - One', size: 2098468 },
              ],
            },
            {
              name: 'snow patrol',
              children: [
                { name: 'Snow Patrol - Chasing Cars', size: 4180909 },
                { name: 'Snow Patrol - Open Your Eyes', size: 569215 },
                { name: 'Snow Patrol - Run', size: 495817 },
              ],
            },
            {
              name: 'oasis',
              children: [
                { name: 'Oasis - Wonderwall', size: 28179752 },
                { name: 'Oasis - Stop Crying Your Heart Out', size: 5800967 },
                { name: 'Oasis - Stand By Me', size: 5424103 },
              ],
            },
            {
              name: 'weezer',
              children: [
                { name: "Weezer - Say It Ain't So", size: 3120010 },
                { name: 'Weezer - Buddy Holly', size: 1179372 },
                { name: 'Weezer - Beverly Hills', size: 1129454 },
              ],
            },
            {
              name: 'bob dylan',
              children: [
                {
                  name: 'Bob Dylan - Forever Young (Slow Version) (Audio)',
                  size: 309302,
                },
                {
                  name: 'Bob Dylan - Thunder On The Mountain (Video)',
                  size: 257197,
                },
                {
                  name: 'Bob Dylan - Subterranean Homesick Blues',
                  size: 232177,
                },
              ],
            },
            {
              name: 'stereophonics',
              children: [
                { name: 'Stereophonics - Maybe Tomorrow', size: 918084 },
                {
                  name: 'Stereophonics - I Wanna Get Lost With You',
                  size: 423955,
                },
                { name: 'Stereophonics - Graffiti On The Train', size: 287245 },
              ],
            },
            {
              name: 'beck',
              children: [
                { name: 'Beck - Loser', size: 2275786 },
                { name: "Beck - Where It's At", size: 223074 },
                { name: 'Beck - Dreams (Official Audio)', size: 166158 },
              ],
            },
            {
              name: 'pj harvey',
              children: [
                { name: 'PJ Harvey - This Is Love', size: 210527 },
                { name: 'PJ Harvey - Down By The Water', size: 175351 },
                { name: 'PJ Harvey - Good Fortune', size: 107510 },
              ],
            },
            {
              name: 'kings of leon',
              children: [
                {
                  name: 'Kings Of Leon - Use Somebody (Official Video)',
                  size: 7374253,
                },
                { name: 'Kings Of Leon - Sex on Fire', size: 6741363 },
                { name: 'Kings Of Leon - WALLS', size: 1758175 },
              ],
            },
            {
              name: 'florence and the machine',
              children: [
                {
                  name:
                    'Florence + The Machine - Dog Days Are Over (2010 Version)',
                  size: 4549751,
                },
                {
                  name: 'Florence + The Machine - Shake It Out',
                  size: 2451429,
                },
                {
                  name: "Florence + The Machine - You've Got the Love",
                  size: 1555961,
                },
              ],
            },
            {
              name: 'soundgarden',
              children: [
                {
                  name: 'Soundgarden - Black Hole Sun (Remastered Audio)',
                  size: 3047605,
                },
                { name: 'Soundgarden - Black Hole Sun', size: 2469141 },
                { name: 'Soundgarden - Fell On Black Days', size: 1427474 },
              ],
            },
            {
              name: 'bullet for my valentine',
              children: [
                {
                  name:
                    "Bullet For My Valentine - Tears Don't Fall (Album Edit - with Scream / with Lighter)",
                  size: 4606864,
                },
                {
                  name: 'Bullet For My Valentine - Your Betrayal',
                  size: 2388022,
                },
                {
                  name: 'Bullet For My Valentine - Waking The Demon',
                  size: 1292846,
                },
              ],
            },
            {
              name: 'nine inch nails',
              children: [
                { name: 'Nine Inch Nails - The Hand That Feeds', size: 554688 },
                { name: 'Nine Inch Nails - Only (Dirty)', size: 367039 },
                {
                  name: "Nine Inch Nails - We're In This Together",
                  size: 274926,
                },
              ],
            },
            {
              name: 'john mellencamp',
              children: [
                { name: 'John Mellencamp - Jack & Diane', size: 569481 },
                { name: 'John Mellencamp - Hurts So Good', size: 416954 },
                { name: 'John Mellencamp - Pink Houses', size: 416338 },
              ],
            },
          ],
        },
        {
          name: 'Music_of_Latin_America',
          children: [
            {
              name: 'cypress hill',
              children: [
                { name: 'Cypress Hill - Lowrider', size: 2229400 },
                {
                  name: 'Cypress Hill - Hits from the Bong (Audio)',
                  size: 1091552,
                },
                {
                  name:
                    'Cypress Hill - No Entiendes La Onda (How I Could Just Kill A Man) (Video)',
                  size: 852355,
                },
              ],
            },
            {
              name: 'pitbull',
              children: [
                {
                  name: 'Pitbull - Rain Over Me ft. Marc Anthony',
                  size: 12354400,
                },
                {
                  name: 'Pitbull - International Love ft. Chris Brown',
                  size: 8369391,
                },
                { name: 'Pitbull - Hotel Room Service', size: 5515151 },
              ],
            },
            {
              name: 'baby bash',
              children: [
                { name: 'Baby Bash - Suga Suga ft. Frankie J', size: 3865730 },
                { name: 'Baby Bash - Cyclone ft. T-Pain', size: 1690112 },
                { name: "Baby Bash - Baby, I'm Back ft. Akon", size: 729029 },
              ],
            },
            {
              name: 'kat deluna',
              children: [
                {
                  name: 'Kat DeLuna - Run The Show ft. Busta Rhymes',
                  size: 3545571,
                },
                { name: 'Kat DeLuna - Drop It Low', size: 890680 },
                {
                  name:
                    'Kat DeLuna - Run The Show (Spanish Version) ft. Don Omar',
                  size: 287585,
                },
              ],
            },
            {
              name: 'xtreme',
              children: [
                { name: 'Xtreme - Shorty, Shorty', size: 112642 },
                { name: 'Xtreme - Adonde Se Fue', size: 55598 },
                { name: 'Xtreme - Baby, Baby', size: 37330 },
              ],
            },
          ],
        },
        {
          name: 'Rhythm_and_blues',
          children: [
            {
              name: 'earth wind and fire',
              children: [
                { name: 'Earth, Wind & Fire - Fantasy (Audio)', size: 697391 },
                {
                  name: 'Earth, Wind & Fire - After The Love Has Gone (Audio)',
                  size: 436291,
                },
                { name: 'Earth, Wind & Fire - Fantasy', size: 329907 },
              ],
            },
            {
              name: 'ne yo',
              children: [
                { name: 'Ne-Yo - Miss Independent', size: 14141458 },
                { name: 'Ne-Yo - Mad', size: 5863254 },
                { name: 'Ne-Yo - One In A Million', size: 5574276 },
              ],
            },
            {
              name: 'mary j blige',
              children: [
                { name: 'Mary J. Blige - Family Affair', size: 7759179 },
                { name: 'Mary J. Blige - Mr. Wrong ft. Drake', size: 6141033 },
                { name: 'Mary J. Blige - Just Fine', size: 1819886 },
              ],
            },
            {
              name: 'mariah carey',
              children: [
                { name: 'Mariah Carey - We Belong Together', size: 15863288 },
                { name: 'Mariah Carey - Angels Cry ft. Ne-Yo', size: 3167344 },
                { name: 'Mariah Carey - Obsessed', size: 1881943 },
              ],
            },
            {
              name: 'chris brown',
              children: [
                {
                  name:
                    'Chris Brown - Loyal (Official Music Video) (Explicit) ft. Lil Wayne, Tyga',
                  size: 24134002,
                },
                { name: 'Chris Brown - With You', size: 13440478 },
                {
                  name:
                    'Chris Brown - Deuces (Explicit Version) ft. Tyga, Kevin McCall',
                  size: 4083712,
                },
              ],
            },
            {
              name: 'r kelly',
              children: [
                {
                  name: 'R. Kelly - Ignition (Remix) (Official Video)',
                  size: 6862842,
                },
                { name: 'R. Kelly - Same Girl', size: 3419624 },
                {
                  name: 'R. Kelly - I Believe I Can Fly (LP Version)',
                  size: 3344089,
                },
              ],
            },
            {
              name: 'alicia keys',
              children: [
                {
                  name: 'Alicia Keys - No One (Official Video)',
                  size: 17736456,
                },
                { name: "Alicia Keys - If I Ain't Got You", size: 7445175 },
                { name: 'Alicia Keys - Girl On Fire', size: 3680373 },
              ],
            },
            {
              name: 'jamiroquai',
              children: [
                { name: 'Jamiroquai - Canned Heat', size: 573163 },
                { name: 'Jamiroquai - Blow Your Mind', size: 418006 },
                { name: 'Jamiroquai - Too Young to Die', size: 310452 },
              ],
            },
            {
              name: 'usher',
              children: [
                { name: 'Usher - Yeah! ft. Lil Jon, Ludacris', size: 18678325 },
                { name: 'Usher - U Got It Bad (Video)', size: 4602324 },
                { name: 'Usher - Burn', size: 4319380 },
              ],
            },
            {
              name: 'monica',
              children: [
                {
                  name: 'Monica - Why I Love You So Much (Album Version)',
                  size: 5099406,
                },
                { name: 'Monica - Angel Of Mine', size: 3203079 },
                {
                  name: 'Monica - Before You Walk Out Of My Life',
                  size: 2674835,
                },
              ],
            },
          ],
        },
        {
          name: 'Electronic_music',
          children: [
            {
              name: 'jamiroquai',
              children: [
                {
                  name: 'Jamiroquai - Virtual Insanity (Official Video)',
                  size: 7142820,
                },
                { name: 'Jamiroquai - Cosmic Girl (Video)', size: 1559508 },
                { name: 'Jamiroquai - Little L', size: 709390 },
              ],
            },
            {
              name: 'mia',
              children: [
                { name: 'M.I.A. - Paper Planes', size: 3296073 },
                { name: 'M.I.A. - Bad Girls', size: 1700785 },
                { name: 'M.I.A. - Borders', size: 632716 },
              ],
            },
            {
              name: 'sade',
              children: [
                {
                  name: 'Sade - No Ordinary Love (Official Video)',
                  size: 4378566,
                },
                {
                  name: 'Sade - Soldier Of Love (Official Video)',
                  size: 535110,
                },
                {
                  name: 'Sade - Cherish The Day (Official Video)',
                  size: 521907,
                },
              ],
            },
            {
              name: 'faithless',
              children: [
                {
                  name: 'Faithless - Insomnia (Official Video)',
                  size: 3609236,
                },
                {
                  name: 'Faithless - We Come 1 (Official Video)',
                  size: 604631,
                },
                {
                  name: 'Faithless - God Is a DJ (Official Video)',
                  size: 583807,
                },
              ],
            },
            {
              name: 'dido',
              children: [
                { name: 'Dido - Thank You (Official Video)', size: 9806654 },
                { name: 'Dido - White Flag (Official Video)', size: 2485686 },
                {
                  name: 'Dido - White Flag (Live at Brixton Academy)',
                  size: 992711,
                },
              ],
            },
            {
              name: 'pitbull',
              children: [
                { name: 'Pitbull - Timber ft. Ke$ha', size: 13619639 },
                {
                  name: 'Pitbull - Rain Over Me ft. Marc Anthony',
                  size: 12354400,
                },
                {
                  name: 'Pitbull - Feel This Moment ft. Christina Aguilera',
                  size: 10743987,
                },
              ],
            },
            {
              name: 'groove armada',
              children: [
                { name: "Groove Armada - Superstylin'", size: 640174 },
                { name: 'Groove Armada - My Friend', size: 168508 },
                {
                  name:
                    "Groove Armada - I See You Baby (Fatboy Slim Remix Uncensored) ft. Gram'ma Funk",
                  size: 79186,
                },
              ],
            },
            {
              name: 'calvin harris',
              children: [
                {
                  name:
                    'Calvin Harris - This Is What You Came For (Official Video) ft. Rihanna',
                  size: 48509055,
                },
                {
                  name: 'Calvin Harris & Disciples - How Deep Is Your Love',
                  size: 12268892,
                },
                {
                  name: 'Calvin Harris - Summer (Official Video)',
                  size: 11096537,
                },
              ],
            },
            {
              name: 'krewella',
              children: [
                { name: 'Krewella - Alive (Video)', size: 951527 },
                { name: 'Krewella - Alive (Acoustic Version)', size: 359724 },
                { name: 'Krewella - Enjoy the Ride', size: 355061 },
              ],
            },
            {
              name: 'justin bieber',
              children: [
                {
                  name: 'Justin Bieber - Sorry (PURPOSE : The Movement)',
                  size: 27978275,
                },
                { name: 'Justin Bieber - What Do You Mean?', size: 16391967 },
                {
                  name: 'Justin Bieber - Beauty And A Beat ft. Nicki Minaj',
                  size: 7151699,
                },
              ],
            },
          ],
        },
        {
          name: 'Classical_music',
          children: [
            {
              name: 'jackie evancho',
              children: [
                {
                  name:
                    'Jackie Evancho - Ave Maria (Live from Longwood Gardens)',
                  size: 84934,
                },
                {
                  name: 'Jackie Evancho - Think of Me (Music Video)',
                  size: 43497,
                },
                { name: 'Jackie Evancho - Silent Night (Video)', size: 32476 },
              ],
            },
            {
              name: 'il divo',
              children: [
                {
                  name: 'Il Divo - Regresa a Mi (Unbreak My Heart) (Video)',
                  size: 2189013,
                },
                { name: 'Il Divo - Adagio (Live Video)', size: 925657 },
                {
                  name:
                    'Il Divo - The Winner Takes It All (Va Todo Al Ganado) (Live Video)',
                  size: 548154,
                },
              ],
            },
            {
              name: 'katherine jenkins',
              children: [
                { name: 'Katherine Jenkins - Home', size: 41219 },
                {
                  name: 'Katherine Jenkins - Quello che faro (Everything I Do)',
                  size: 32588,
                },
                { name: 'Katherine Jenkins - Rejoice', size: 13848 },
              ],
            },
            {
              name: 'the priests',
              children: [
                {
                  name: 'The Priests - Ave Maria (Live in Armagh)',
                  size: 10013,
                },
                {
                  name: 'The Priests - O Holy Night (Live in Armagh)',
                  size: 8279,
                },
                { name: 'The Priests - Silent Night (Video)', size: 2657 },
              ],
            },
            {
              name: 'charlotte church',
              children: [
                { name: 'Charlotte Church - Dream a Dream', size: 35661 },
                { name: 'Charlotte Church - Amazing Grace', size: 19894 },
                {
                  name: 'Charlotte Church - Call My Name (Video)',
                  size: 14425,
                },
              ],
            },
          ],
        },
        {
          name: 'Hip_hop_music',
          children: [
            {
              name: 'tyga',
              children: [
                { name: 'Tyga - Hookah ft. Young Thug', size: 7473880 },
                { name: 'Tyga - 1 of 1', size: 1372127 },
                {
                  name: 'Tyga - Wait For A Minute (Explicit) ft. Justin Bieber',
                  size: 1336375,
                },
              ],
            },
            {
              name: 'philthy rich',
              children: [
                {
                  name: 'Philthy Rich - Make A Living ft. IAMSU!',
                  size: 326441,
                },
                {
                  name: 'Philthy Rich, Stevie Joe - Overdose ft. Joe Blow',
                  size: 210134,
                },
                {
                  name:
                    'Philthy Rich, Pooh Hefner - A.O.B. ft. Too $hort, 4rAx',
                  size: 117624,
                },
              ],
            },
            {
              name: 'eminem',
              children: [
                {
                  name: 'Eminem - Love The Way You Lie ft. Rihanna',
                  size: 45948725,
                },
                { name: 'Eminem - Without Me', size: 40804158 },
                { name: 'Eminem - Rap God (Explicit)', size: 40224453 },
              ],
            },
            {
              name: 'nicki minaj',
              children: [
                { name: 'Nicki Minaj - Anaconda', size: 16778263 },
                {
                  name: 'Nicki Minaj - Only ft. Drake, Lil Wayne, Chris Brown',
                  size: 9819757,
                },
                { name: 'Nicki Minaj - Super Bass', size: 7689535 },
              ],
            },
            {
              name: 'future',
              children: [
                { name: 'Future - Low Life ft. The Weeknd', size: 18608471 },
                { name: 'Future - Where Ya At ft. Drake', size: 2859795 },
                { name: 'Future - Stick Talk', size: 2850119 },
              ],
            },
            {
              name: '50 cent',
              children: [
                {
                  name: "50 Cent - In Da Club (Int'l Version)",
                  size: 22027937,
                },
                { name: '50 Cent - Candy Shop ft. Olivia', size: 13196174 },
                {
                  name: '50 Cent - 21 Questions ft. Nate Dogg',
                  size: 11293746,
                },
              ],
            },
            {
              name: 'rick ross',
              children: [
                {
                  name:
                    'Rick Ross - Aston Martin Music ft. Drake, Chrisette Michele',
                  size: 6592400,
                },
                {
                  name:
                    'Rick Ross - Diced Pineapples (Explicit) ft. Wale, Drake',
                  size: 2317374,
                },
                { name: "Rick Ross - Hustlin'", size: 1387531 },
              ],
            },
            {
              name: 'kanye west',
              children: [
                {
                  name: 'Jay-Z & Kanye West - Ni**as In Paris (Explicit)',
                  size: 7246685,
                },
                {
                  name: 'Kanye West - Gold Digger ft. Jamie Foxx',
                  size: 6142898,
                },
                { name: 'Kanye West - Stronger', size: 6004677 },
              ],
            },
            {
              name: 'chris brown',
              children: [
                {
                  name:
                    'Chris Brown - Loyal (Official Music Video) (Explicit) ft. Lil Wayne, Tyga',
                  size: 24134002,
                },
                { name: 'Chris Brown, Tyga - Ayo (Explicit)', size: 7609118 },
                { name: 'Chris Brown - Kiss Kiss ft. T-Pain', size: 6423524 },
              ],
            },
            {
              name: 'ludacris',
              children: [
                { name: 'Ludacris - Get Back', size: 1719976 },
                {
                  name: 'Ludacris - My Chick Bad ft. Nicki Minaj',
                  size: 1125737,
                },
                { name: 'Ludacris - Act A Fool (MTV Version)', size: 910515 },
              ],
            },
            {
              name: 'j stalin',
              children: [
                { name: 'J. Stalin - No Way', size: 193498 },
                {
                  name: "J. Stalin & Lil' Blood - Come Out At Night",
                  size: 68891,
                },
                {
                  name: "J. Stalin - Can't Fuck Wit U ft. Lil June, Jonn Hart",
                  size: 43662,
                },
              ],
            },
            {
              name: 'troy ave',
              children: [
                {
                  name: 'Troy Ave - She Belongs To The Game ft. Young Lito',
                  size: 1097264,
                },
                {
                  name: 'Troy Ave - Chuck Norris (Hoes & Gangstas) (Audio)',
                  size: 110325,
                },
                { name: 'Troy Ave - Doo Doo (Official Video)', size: 22744 },
              ],
            },
            {
              name: 'the game',
              children: [
                {
                  name: 'The Game, 50 Cent - Hate It Or Love It',
                  size: 4226491,
                },
                { name: 'The Game - My Life ft. Lil Wayne', size: 2983111 },
                { name: 'The Game - How We Do', size: 2540136 },
              ],
            },
            {
              name: 'mary j blige',
              children: [
                { name: 'Mary J. Blige - Family Affair', size: 7759179 },
                { name: 'Mary J. Blige - Mr. Wrong ft. Drake', size: 6141033 },
                { name: 'Mary J. Blige - Be Without You', size: 3914181 },
              ],
            },
            {
              name: 'birdman',
              children: [
                { name: 'Birdman - Pop Bottles ft. Lil Wayne', size: 370090 },
                {
                  name: 'Birdman - Y.U. MAD ft. Nicki Minaj, Lil Wayne',
                  size: 260480,
                },
                {
                  name:
                    'Birdman - 100 Million ft. Young Jeezy, Rick Ross, Lil Wayne',
                  size: 248815,
                },
              ],
            },
            {
              name: '2 chainz',
              children: [
                {
                  name:
                    '2 Chainz & Wiz Khalifa - We Own It (Fast & Furious) (Lyric Video)',
                  size: 5897382,
                },
                {
                  name: '2 Chainz - No Lie (Explicit) ft. Drake',
                  size: 1237700,
                },
                { name: '2 Chainz - Watch Out (Explicit)', size: 977743 },
              ],
            },
          ],
        },
        {
          name: 'Military',
          children: [
            {
              name: 'toby keith',
              children: [
                { name: 'Toby Keith - American Soldier', size: 1326022 },
                {
                  name:
                    'Toby Keith - Courtesy Of The Red, White And Blue (The Angry American)',
                  size: 756414,
                },
              ],
            },
            {
              name: 'thirty seconds to mars',
              children: [
                { name: 'Thirty Seconds To Mars - This Is War', size: 582558 },
                {
                  name:
                    'Thirty Seconds To Mars - This Is War With 100 Suns (Uncensored)',
                  size: 9386,
                },
              ],
            },
            {
              name: 'keyshia cole',
              children: [{ name: 'Keyshia Cole - New Nu', size: 20317 }],
            },
            {
              name: 'billy ray cyrus',
              children: [
                { name: 'Billy Ray Cyrus - Some Gave All', size: 176408 },
              ],
            },
            {
              name: 'the isley brothers',
              children: [
                {
                  name:
                    'The Isley Brothers - Ballad for the Fallen Soldier (Video)',
                  size: 6685,
                },
              ],
            },
          ],
        },
        {
          name: 'Soul_music',
          children: [
            {
              name: 'ne yo',
              children: [
                { name: 'Ne-Yo - Miss Independent', size: 14141458 },
                { name: 'Ne-Yo - Mad', size: 5863254 },
                { name: 'Ne-Yo - One In A Million', size: 5574276 },
              ],
            },
            {
              name: 'earth wind and fire',
              children: [
                { name: 'Earth, Wind & Fire - Fantasy (Audio)', size: 697391 },
                {
                  name: 'Earth, Wind & Fire - After The Love Has Gone (Audio)',
                  size: 436291,
                },
                { name: 'Earth, Wind & Fire - Fantasy', size: 329907 },
              ],
            },
            {
              name: 'r kelly',
              children: [
                {
                  name: 'R. Kelly - Ignition (Remix) (Official Video)',
                  size: 6862842,
                },
                {
                  name: 'R. Kelly - Step In The Name Of Love (The Video)',
                  size: 5685196,
                },
                { name: 'R. Kelly - Same Girl', size: 3419624 },
              ],
            },
            {
              name: 'chris brown',
              children: [
                {
                  name:
                    'Chris Brown - Loyal (Official Music Video) (Explicit) ft. Lil Wayne, Tyga',
                  size: 24134002,
                },
                { name: 'Chris Brown - With You', size: 13440478 },
                {
                  name:
                    'Chris Brown - Deuces (Explicit Version) ft. Tyga, Kevin McCall',
                  size: 4083712,
                },
              ],
            },
            {
              name: 'sade',
              children: [
                { name: 'Sade - By Your Side (Official Video)', size: 2011653 },
                {
                  name: 'Sade - King Of Sorrow (Official Video)',
                  size: 1013252,
                },
                { name: 'Sade - Kiss Of Life (Official Video)', size: 745345 },
              ],
            },
            {
              name: 'alicia keys',
              children: [
                {
                  name: 'Alicia Keys - No One (Official Video)',
                  size: 17736456,
                },
                { name: "Alicia Keys - If I Ain't Got You", size: 7445175 },
                { name: "Alicia Keys - Fallin'", size: 6055824 },
              ],
            },
            {
              name: 'mary j blige',
              children: [
                { name: 'Mary J. Blige - Family Affair', size: 7759179 },
                { name: 'Mary J. Blige - Mr. Wrong ft. Drake', size: 6141033 },
                { name: 'Mary J. Blige - Just Fine', size: 1819886 },
              ],
            },
            {
              name: 'john legend',
              children: [
                {
                  name: 'John Legend - All of Me (Edited Video)',
                  size: 31077755,
                },
                {
                  name:
                    'John Legend - Tonight (Best You Ever Had) ft. Ludacris',
                  size: 1948850,
                },
                {
                  name: 'John Legend - You & I (Nobody in the World) (Video)',
                  size: 1236447,
                },
              ],
            },
            {
              name: 'jamiroquai',
              children: [
                { name: 'Jamiroquai - Canned Heat', size: 573163 },
                { name: 'Jamiroquai - Blow Your Mind', size: 418006 },
                { name: 'Jamiroquai - Too Young to Die', size: 310452 },
              ],
            },
            {
              name: 'luther vandross',
              children: [
                {
                  name: 'Luther Vandross - Dance With My Father',
                  size: 4927767,
                },
                {
                  name: 'Luther Vandross - Endless Love ft. Mariah Carey',
                  size: 3055908,
                },
                {
                  name: 'Luther Vandross - Never Too Much (Video)',
                  size: 727267,
                },
              ],
            },
            {
              name: 'monica',
              children: [
                {
                  name: 'Monica - Why I Love You So Much (Album Version)',
                  size: 5099406,
                },
                { name: 'Monica - Angel Of Mine', size: 3203079 },
                {
                  name: 'Monica - Before You Walk Out Of My Life',
                  size: 2674835,
                },
              ],
            },
          ],
        },
        {
          name: 'Pop_music',
          children: [
            {
              name: 'westlife',
              children: [
                { name: 'Westlife - My Love (Coast to Coast)', size: 7383040 },
                {
                  name: 'Westlife - If I Let You Go (Official Video)',
                  size: 6103387,
                },
                { name: 'Westlife - My Love (Official Video)', size: 5923898 },
              ],
            },
            {
              name: 'billy joel',
              children: [
                {
                  name: 'Billy Joel - Uptown Girl (Official Video)',
                  size: 5133617,
                },
                { name: 'Billy Joel - Piano Man (Video)', size: 3669551 },
                {
                  name:
                    "Billy Joel - We Didn't Start the Fire (Official Video)",
                  size: 1942468,
                },
              ],
            },
            {
              name: 'mariah carey',
              children: [
                { name: 'Mariah Carey - We Belong Together', size: 15863288 },
                {
                  name: 'Mariah Carey - All I Want For Christmas Is You',
                  size: 9007471,
                },
                {
                  name: 'Mariah Carey, Boyz II Men - One Sweet Day',
                  size: 8465082,
                },
              ],
            },
            {
              name: 'justin bieber',
              children: [
                {
                  name:
                    'Justin Bieber - Love Yourself  (PURPOSE : The Movement)',
                  size: 28252804,
                },
                {
                  name: 'Justin Bieber - Sorry (PURPOSE : The Movement)',
                  size: 27978275,
                },
                {
                  name: 'Justin Bieber - Never Say Never ft. Jaden Smith',
                  size: 16417326,
                },
              ],
            },
            {
              name: 'take that',
              children: [
                {
                  name: 'Take That - Back for Good (Official Video)',
                  size: 2015995,
                },
                { name: 'Take That - The Flood', size: 786602 },
                { name: 'Take That - Patience', size: 602590 },
              ],
            },
            {
              name: 'celine dion',
              children: [
                {
                  name: "Cline Dion - I'm Alive (Official Music Video)",
                  size: 6443658,
                },
                {
                  name: "Cline Dion - That's The Way It Is (Video)",
                  size: 5671168,
                },
                {
                  name: "Cline Dion - It's All Coming Back To Me Now",
                  size: 4315851,
                },
              ],
            },
            {
              name: 'demi lovato',
              children: [
                { name: 'Demi Lovato - Heart Attack', size: 9985526 },
                {
                  name: 'Demi Lovato - Stone Cold (Official Video)',
                  size: 7650060,
                },
                {
                  name:
                    'Demi Lovato - Give Your Heart a Break (Official Video)',
                  size: 6724718,
                },
              ],
            },
            {
              name: 'beyonce',
              children: [
                { name: 'Beyonc - Halo', size: 40107309 },
                {
                  name:
                    'Beyonc - Single Ladies (Put a Ring on It) (Video Version)',
                  size: 9704527,
                },
                { name: 'Beyonc - Love On Top (Video Edit)', size: 8486706 },
              ],
            },
            {
              name: 'mary j blige',
              children: [
                { name: 'Mary J. Blige - Family Affair', size: 7759179 },
                { name: 'Mary J. Blige - Mr. Wrong ft. Drake', size: 6141033 },
                { name: 'Mary J. Blige, U2 - One', size: 6003234 },
              ],
            },
            {
              name: 'sade',
              children: [
                {
                  name: 'Sade - No Ordinary Love (Official Video)',
                  size: 4378566,
                },
                {
                  name: 'Sade - The Sweetest Taboo (Official Video)',
                  size: 2423395,
                },
                { name: 'Sade - By Your Side (Official Video)', size: 2011653 },
              ],
            },
            {
              name: 'pink',
              children: [
                {
                  name: 'P!nk - Just Give Me A Reason ft. Nate Ruess',
                  size: 29864037,
                },
                { name: 'P!nk - Try', size: 7333746 },
                { name: 'P!nk - So What', size: 5546139 },
              ],
            },
            {
              name: 'lady gaga',
              children: [
                { name: 'Lady Gaga - Bad Romance', size: 22223949 },
                { name: 'Lady Gaga - Poker Face', size: 16435212 },
                { name: 'Lady Gaga - Telephone ft. Beyonc', size: 5183309 },
              ],
            },
            {
              name: 'ne yo',
              children: [
                { name: 'Ne-Yo - Miss Independent', size: 14141458 },
                { name: 'Ne-Yo - Mad', size: 5863254 },
                { name: 'Ne-Yo - One In A Million', size: 5574276 },
              ],
            },
            {
              name: 'chris brown',
              children: [
                { name: 'Chris Brown - With You', size: 13440478 },
                { name: 'Chris Brown, Tyga - Ayo (Explicit)', size: 7609118 },
                { name: 'Chris Brown - Kiss Kiss ft. T-Pain', size: 6423524 },
              ],
            },
            {
              name: 'steps',
              children: [
                { name: 'Steps - 5, 6, 7, 8', size: 489455 },
                { name: 'Steps - Tragedy (Video)', size: 298143 },
                { name: "Steps - It's the Way You Make Me Feel", size: 222712 },
              ],
            },
            {
              name: 'rihanna',
              children: [
                { name: 'Rihanna - Diamonds', size: 28679330 },
                { name: 'Rihanna - Stay ft. Mikky Ekko', size: 19801782 },
                { name: 'Rihanna - Take A Bow', size: 18352815 },
              ],
            },
            {
              name: 'maroon 5',
              children: [
                { name: 'Maroon 5 - Sugar', size: 70326910 },
                { name: 'Maroon 5 - One More Night', size: 11504909 },
                { name: 'Maroon 5 - Animals', size: 10057806 },
              ],
            },
            {
              name: 'jamiroquai',
              children: [
                {
                  name: 'Jamiroquai - Virtual Insanity (Official Video)',
                  size: 7142820,
                },
                { name: 'Jamiroquai - Cosmic Girl (Video)', size: 1559508 },
                { name: 'Jamiroquai - Little L', size: 709390 },
              ],
            },
            {
              name: 'george michael',
              children: [
                {
                  name: 'George Michael - Careless Whisper (Official Video)',
                  size: 30180560,
                },
                {
                  name:
                    "George Michael, Elton John - Don't Let The Sun Go Down On Me (Live)",
                  size: 4026211,
                },
                { name: 'George Michael - One More Try', size: 2873399 },
              ],
            },
            {
              name: 'ariana grande',
              children: [
                {
                  name: 'Ariana Grande - Side To Side ft. Nicki Minaj',
                  size: 42517923,
                },
                { name: 'Ariana Grande - Into You', size: 14045512 },
                {
                  name: 'Ariana Grande - One Last Time (Lyric Video)',
                  size: 13251634,
                },
              ],
            },
            {
              name: 'alicia keys',
              children: [
                {
                  name: 'Alicia Keys - No One (Official Video)',
                  size: 17736456,
                },
                { name: "Alicia Keys - Fallin'", size: 6055824 },
                { name: 'Alicia Keys - Girl On Fire', size: 3680373 },
              ],
            },
            {
              name: 'r kelly',
              children: [
                {
                  name: 'R. Kelly - Ignition (Remix) (Official Video)',
                  size: 6862842,
                },
                {
                  name: 'R. Kelly - Step In The Name Of Love (The Video)',
                  size: 5685196,
                },
                { name: 'R. Kelly - Same Girl', size: 3419624 },
              ],
            },
            {
              name: 'dido',
              children: [
                { name: 'Dido - Thank You (Official Video)', size: 9806654 },
                { name: 'Dido - White Flag (Official Video)', size: 2485686 },
                { name: 'Dido - Life for Rent', size: 1732906 },
              ],
            },
            {
              name: 'britney spears',
              children: [
                {
                  name: 'Britney Spears - ...Baby One More Time',
                  size: 11345542,
                },
                {
                  name: 'Britney Spears - Toxic (Official Video)',
                  size: 10342800,
                },
                {
                  name:
                    'Britney Spears - Oops!...I Did It Again (Official Video)',
                  size: 8732469,
                },
              ],
            },
            {
              name: 'earth wind and fire',
              children: [
                { name: 'Earth, Wind & Fire - September', size: 24148826 },
                {
                  name: 'Earth, Wind & Fire - Boogie Wonderland',
                  size: 15185659,
                },
                {
                  name: "Earth, Wind & Fire - Let's Groove (Video Version)",
                  size: 4588226,
                },
              ],
            },
            {
              name: 'michael jackson',
              children: [
                {
                  name: 'Michael Jackson - Billie Jean (Official Video)',
                  size: 44431100,
                },
                {
                  name:
                    'Michael Jackson - They Dont Care About Us (Brazil Version) (Official Video)',
                  size: 29383655,
                },
                {
                  name: 'Michael Jackson - Beat It (Official Video)',
                  size: 22227424,
                },
              ],
            },
            {
              name: 'whitney houston',
              children: [
                {
                  name: 'Whitney Houston - I Will Always Love You',
                  size: 35998213,
                },
                {
                  name: 'Whitney Houston - I Have Nothing (Official Video)',
                  size: 28586087,
                },
                {
                  name:
                    'Whitney Houston - When You Believe (From The Prince Of Egypt)',
                  size: 12720040,
                },
              ],
            },
            {
              name: 'john mayer',
              children: [
                {
                  name: "John Mayer - Free Fallin' (Live at the Nokia Theatre)",
                  size: 2553695,
                },
                {
                  name: 'John Mayer - Your Body Is A Wonderland',
                  size: 1565489,
                },
                {
                  name: 'John Mayer - Waiting On the World to Change (Video)',
                  size: 879893,
                },
              ],
            },
            {
              name: 'onerepublic',
              children: [
                { name: 'OneRepublic - Counting Stars', size: 102816063 },
                { name: 'OneRepublic - Secrets', size: 3544119 },
                { name: 'OneRepublic - Good Life', size: 2873168 },
              ],
            },
            {
              name: 'one direction',
              children: [
                {
                  name:
                    'One Direction - What Makes You Beautiful (Official Video)',
                  size: 21347921,
                },
                {
                  name: 'One Direction - Drag Me Down (Official Video)',
                  size: 12988871,
                },
                {
                  name: 'One Direction - Best Song Ever (Official Video)',
                  size: 8592879,
                },
              ],
            },
            {
              name: 'eurythmics',
              children: [
                {
                  name:
                    'Eurythmics - Sweet Dreams (Are Made Of This) (Official Video)',
                  size: 22793236,
                },
                {
                  name:
                    'Eurythmics - There Must Be An Angel (Playing With My Heart) (Remastered)',
                  size: 1014541,
                },
                {
                  name: 'Eurythmics - Here Comes The Rain Again (Remastered)',
                  size: 1009589,
                },
              ],
            },
            {
              name: 'r5',
              children: [
                {
                  name: "R5 - (I Can't) Forget About You (Official Video)",
                  size: 581906,
                },
                { name: 'R5 - Pass Me By (Official Video)', size: 369566 },
                {
                  name: 'R5 - Heart Made Up On You (Concept Video)',
                  size: 356387,
                },
              ],
            },
            {
              name: 'the script',
              children: [
                {
                  name:
                    'The Script - The Man Who Cant Be Moved (Official Video)',
                  size: 13374816,
                },
                {
                  name:
                    'The Script - Hall of Fame (Official Video) ft. will.i.am',
                  size: 8169892,
                },
                {
                  name: 'The Script - Breakeven (Official Video)',
                  size: 5377041,
                },
              ],
            },
            {
              name: 'kelly clarkson',
              children: [
                {
                  name: 'Kelly Clarkson - Because Of You (VIDEO)',
                  size: 17024258,
                },
                {
                  name: "Kelly Clarkson - Stronger (What Doesn't Kill You)",
                  size: 7742992,
                },
                {
                  name: 'Kelly Clarkson - Since U Been Gone (VIDEO)',
                  size: 2063750,
                },
              ],
            },
            {
              name: 'lisa stansfield',
              children: [
                {
                  name: 'Lisa Stansfield - All Around the World',
                  size: 1481769,
                },
                {
                  name: 'Lisa Stansfield, Barry White - All Around the World',
                  size: 1429316,
                },
                {
                  name: 'Lisa Stansfield - Change (Video (Colour Version))',
                  size: 211927,
                },
              ],
            },
            {
              name: 'usher',
              children: [
                { name: 'Usher - Yeah! ft. Lil Jon, Ludacris', size: 18678325 },
                { name: 'Usher - U Got It Bad (Video)', size: 4602324 },
                { name: 'Usher - Burn', size: 4319380 },
              ],
            },
            {
              name: 'pitbull',
              children: [
                { name: 'Pitbull - Timber ft. Ke$ha', size: 13619639 },
                {
                  name: 'Pitbull - Rain Over Me ft. Marc Anthony',
                  size: 12354400,
                },
                {
                  name: 'Pitbull - Feel This Moment ft. Christina Aguilera',
                  size: 10743987,
                },
              ],
            },
          ],
        },
      ],
    };

    let color = d3
      .scaleLinear()
      .domain([-1, 5])
      .range(['hsl(152,80%,80%)', 'hsl(228,30%,40%)'])
      .interpolate(d3.interpolateHcl);

    let diameter = oWidth;

    let svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', oWidth)
      .attr('height', diameter + 50)
      .attr('class', 'bubble');

    let g = svg
      .append('g')
      .attr(
        'transform',
        'translate(' + oWidth / 2 + ',' + (diameter / 2 + 10) + ')'
      );

    let pack = d3
      .pack()
      .size([diameter, diameter])
      .padding(3);

    root = d3
      .hierarchy(root)
      .sum(function(d) {
        return d.size;
      })
      .sort(function(a, b) {
        return b.value - a.value;
      });

    let focus = root,
      nodes = pack(root).descendants(),
      view;

    let circle = g
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', function(d) {
        return d.parent
          ? d.children
            ? 'node'
            : 'node node--leaf'
          : 'node node--root';
      })
      .style('fill', function(d) {
        if (d == root) return 'transparent';
        return d.children ? color(d.depth) : null;
      })
      .on('click', function(d) {
        if (focus !== d) {
          focus = d;
          zoom(d);
        } else {
          if (d !== root) {
            focus = d.parent;
            zoom(d.parent);
          }
        }
      })
      .style('cursor', 'pointer')
      .style('stroke', 'black')
      .style('stroke-width', '0px')
      .on('mouseover', function(d) {
        if (d !== root) d3.select(this).style('stroke-width', '1.5px');
      })
      .on('mouseleave', function() {
        d3.select(this).style('stroke-width', '0px');
      });

    let text = g
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'label')
      .style('fill-opacity', function(d) {
        return d.parent === root ? 1 : 0;
      })
      .style('display', function(d) {
        return d.parent === root ? 'inline' : 'none';
      })
      .text(function(d) {
        return d.data.name.split('_').join(' ');
      });

    let node = g.selectAll('circle,text');

    svg.style('background', 'transparent').on('click', function() {
      zoom(root);
    });

    zoomTo([root.x, root.y, root.r * 2]);

    d3.selectAll('.node--leaf').style('fill', 'white');
    d3.selectAll('.label')
      .style('pointer-events', 'none')
      .style('text-anchor', 'middle');

    function zoom(d) {
      let focus0 = focus;

      let transition = d3
        .transition()
        .duration(750)
        .tween('zoom', function(d) {
          let i = d3.interpolateZoom(view, [focus0.x, focus0.y, focus0.r * 2]);
          return function(t) {
            zoomTo(i(t));
          };
        });

      transition
        .selectAll('text')
        .filter(function(d) {
          return d.parent === focus || this.style.display === 'inline';
        })
        .style('fill-opacity', function(d) {
          return d.parent === focus ? 1 : 0;
        })
        .on('start', function(d) {
          if (d.parent === focus) this.style.display = 'inline';
        })
        .on('end', function(d) {
          if (d.parent !== focus) this.style.display = 'none';
        });
    }

    function zoomTo(v) {
      let k = diameter / v[2];
      view = v;
      node.attr('transform', function(d) {
        return 'translate(' + (d.x - v[0]) * k + ',' + (d.y - v[1]) * k + ')';
      });
      circle.attr('r', function(d) {
        return d.r * k;
      });
    }
  }

  render() {
    return <div ref="canvas"></div>;
  }
}

export default GenreBubbles;
