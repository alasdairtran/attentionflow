import React, { Component } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import { getVideoInfo } from '../VideoEgo/popout';
import { getIncomingOutgoing } from '../VideoEgo/incomingOutgoing';

class WikiFlow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clickedOnSong: false,
      clickedVideoID: null,
    };
  }

  componentDidMount() {
    this.drawTimePanel();
  }

  drawTimePanel() {
    const data = {
      nodes: [
        {
          id: 353191,
          title: 'Yellow vests movement',
          kind: 'central',
          attn: 0,
          fx: 568,
          fy: 318,
          series: [
            1513,
            1460,
            1487,
            1329,
            1344,
            1511,
            1502,
            1499,
            1511,
            1431,
            1094,
            1415,
            1635,
            1487,
            1400,
            1391,
            1344,
            1317,
            1239,
            1452,
            1348,
            1472,
            1253,
            1138,
            1041,
            1132,
            1218,
            1304,
            1570,
            1227,
            1040,
            2548,
            2561,
            4209,
            2691,
            1649,
            1409,
            1309,
            1355,
            1006,
            1204,
            1057,
            1050,
            1045,
            1005,
            954,
            1036,
            1186,
            1139,
            1152,
            1172,
            1109,
            1168,
            1307,
            1216,
            1165,
            1317,
            1292,
            1311,
            1025,
            1042,
            1437,
            1337,
            1618,
            1323,
            1203,
            1048,
            1199,
            1298,
            1276,
            1346,
            1168,
            1155,
            1040,
            1285,
            1223,
            1139,
            1150,
            1127,
            1136,
            924,
            1022,
            1134,
            1107,
            1044,
            956,
            995,
            876,
            1070,
            1051,
            1058,
            903,
            1042,
            925,
            1017,
            1107,
            1121,
            1030,
            970,
            849,
            891,
            834,
            942,
            1069,
            1124,
            1279,
            1770,
            2340,
            3309,
            4555,
            5004,
            5056,
            4893,
            2947,
            2294,
            2052,
            2003,
            2133,
            1793,
            1573,
            1348,
            1080,
            1148,
            1156,
            1251,
            1138,
            1050,
            1097,
            867,
            754,
            926,
            944,
            992,
            867,
            821,
            858,
            964,
            928,
            1004,
            825,
          ],
        },
        {
          id: 720,
          title: 'Arc de Triomphe',
          kind: 'neighbor',
          attn: 0.0354412004484662,
          fx: 123,
          fy: 456,
          series: [
            1814,
            1974,
            1940,
            2049,
            2179,
            2368,
            2171,
            2196,
            1882,
            1883,
            1992,
            2152,
            1984,
            1962,
            1961,
            1806,
            1661,
            1606,
            1813,
            1918,
            1857,
            1776,
            1790,
            1763,
            1641,
            1787,
            1860,
            1890,
            1738,
            1570,
            1272,
            1214,
            1361,
            1319,
            1262,
            1379,
            1364,
            1313,
            1311,
            1511,
            1592,
            1513,
            1740,
            1668,
            1768,
            1688,
            1817,
            1968,
            1763,
            1886,
            1908,
            1886,
            1782,
            2018,
            1833,
            1610,
            1777,
            2067,
            2106,
            1874,
            2132,
            2132,
            1922,
            1967,
            1767,
            1840,
            1766,
            1877,
            2621,
            2073,
            2016,
            2087,
            1957,
            1730,
            1987,
            1991,
            1993,
            2102,
            2040,
            1854,
            1572,
            1790,
            1910,
            2013,
            1907,
            2168,
            3889,
            2146,
            1928,
            2125,
            2177,
            2000,
            2055,
            1805,
            1462,
            1667,
            1877,
            1744,
            1770,
            1699,
            1735,
            1507,
            1811,
            1772,
            1639,
            1608,
            1551,
            1388,
            1348,
            1490,
            1663,
            1522,
            1607,
            1607,
            1421,
            1351,
            1566,
            1605,
            1560,
            1648,
            1749,
            1523,
            1278,
            1478,
            1349,
            1300,
            1337,
            1332,
            1353,
            1220,
            1393,
            1386,
            1522,
            1355,
            1373,
            1296,
            1318,
            1330,
            1345,
            1303,
          ],
        },
        {
          id: 349594,
          title: 'Joker (2019 film)',
          kind: 'neighbor',
          attn: 0.02799676757838045,
          fx: 540,
          fy: 194,
          series: [
            62587,
            52933,
            52282,
            67696,
            71928,
            53240,
            39795,
            35515,
            33313,
            36988,
            44569,
            44773,
            32691,
            26451,
            25189,
            23869,
            25596,
            33408,
            34009,
            25311,
            22093,
            20761,
            19830,
            21270,
            30731,
            33813,
            24380,
            19835,
            18550,
            16742,
            18681,
            27364,
            30821,
            21826,
            19739,
            19101,
            19700,
            21571,
            29254,
            31922,
            23309,
            20278,
            19520,
            19152,
            20666,
            25856,
            27073,
            21202,
            19806,
            18752,
            19345,
            19273,
            22795,
            22336,
            17496,
            17432,
            16959,
            18202,
            79168,
            24706,
            26520,
            22012,
            17016,
            16444,
            17638,
            20073,
            26757,
            28622,
            42530,
            38882,
            32702,
            27115,
            26104,
            34510,
            33780,
            24859,
            21287,
            21332,
            21193,
            19996,
            23874,
            24304,
            17916,
            17375,
            18184,
            18125,
            17082,
            22366,
            22245,
            16937,
            16126,
            16722,
            17126,
            16144,
            21616,
            95753,
            47731,
            28442,
            32737,
            23228,
            25414,
            32934,
            39142,
            29561,
            22873,
            20750,
            20817,
            24654,
            24958,
            27231,
            20332,
            16976,
            18501,
            19008,
            17966,
            20814,
            23543,
            16656,
            15028,
            14104,
            13708,
            13578,
            16424,
            36965,
            21726,
            14467,
            13060,
            12408,
            12727,
            16236,
            17296,
            13622,
            11759,
            12243,
            11291,
            11738,
            16382,
            17977,
            13268,
            12731,
          ],
        },
        {
          id: 315904,
          title: 'Emmanuel Macron',
          kind: 'neighbor',
          attn: 0.022770619552050318,
          fx: 181,
          fy: 194,
          series: [
            3570,
            3698,
            4025,
            4201,
            3875,
            4053,
            3850,
            3722,
            3678,
            3513,
            3313,
            3842,
            4339,
            4169,
            5110,
            3624,
            3500,
            3456,
            4015,
            3747,
            3468,
            3427,
            3636,
            3471,
            3123,
            3517,
            3592,
            3784,
            3890,
            6426,
            10750,
            7043,
            8013,
            10174,
            10611,
            5866,
            4743,
            4608,
            4439,
            5289,
            4915,
            4578,
            4922,
            5262,
            5930,
            7565,
            6330,
            5016,
            4913,
            4574,
            4491,
            4234,
            4406,
            4959,
            5853,
            6263,
            6180,
            5953,
            4832,
            4712,
            6419,
            11689,
            10125,
            7934,
            6927,
            8119,
            6509,
            6631,
            6549,
            6721,
            7038,
            6468,
            6551,
            6536,
            6165,
            6027,
            9636,
            7605,
            5923,
            6078,
            5841,
            5954,
            5271,
            5511,
            5509,
            6818,
            6549,
            5287,
            5365,
            5227,
            4926,
            4852,
            5897,
            5024,
            4537,
            4600,
            4714,
            6262,
            5151,
            4209,
            3907,
            3934,
            4021,
            3890,
            4204,
            4083,
            4093,
            3940,
            3542,
            4034,
            3793,
            3977,
            4193,
            3845,
            3824,
            4310,
            4159,
            3698,
            4187,
            3578,
            3610,
            4064,
            4185,
            5239,
            6884,
            4796,
            4345,
            8926,
            5852,
            4335,
            3966,
            4068,
            4322,
            4126,
            3892,
            3828,
            4259,
            5150,
            7274,
            5994,
          ],
        },
        {
          id: 326280,
          title: 'Turning Point USA',
          kind: 'neighbor',
          attn: 0.03140008707331227,
          fx: 369,
          fy: 456,
          series: [
            1715,
            1599,
            1473,
            2508,
            1606,
            1475,
            1618,
            2060,
            2047,
            2657,
            2079,
            2245,
            4241,
            2939,
            1991,
            2694,
            2851,
            1924,
            3166,
            29515,
            5385,
            3019,
            3981,
            2316,
            2339,
            8785,
            3413,
            3677,
            1970,
            1533,
            1546,
            1356,
            1800,
            1454,
            1141,
            1045,
            1032,
            1170,
            1172,
            1421,
            3048,
            1939,
            1361,
            1326,
            1315,
            1219,
            1484,
            1434,
            1331,
            1133,
            1576,
            1726,
            1300,
            2244,
            2175,
            1646,
            1263,
            1288,
            1748,
            1547,
            2033,
            4011,
            1873,
            1754,
            1528,
            1701,
            6221,
            4063,
            3277,
            2029,
            2323,
            1935,
            1578,
            1592,
            1275,
            1707,
            1394,
            1460,
            1476,
            1155,
            968,
            1138,
            2186,
            2308,
            2252,
            1432,
            1375,
            1890,
            1853,
            1954,
            1753,
            1732,
            1914,
            1685,
            1510,
            2174,
            2807,
            2441,
            1852,
            1989,
            1643,
            1426,
            2717,
            2729,
            2231,
            1997,
            2270,
            3921,
            3631,
            3994,
            3822,
            4019,
            6557,
            12403,
            8944,
            8012,
            6703,
            6694,
            7063,
            7031,
            5349,
            4383,
            4201,
            4095,
            3829,
            3550,
            3899,
            3192,
            3456,
            3362,
            6067,
            4580,
            7210,
            8155,
            4167,
            3128,
            3177,
            3637,
            3265,
            4648,
          ],
        },
        {
          id: 336053,
          title: 'La République En Marche!',
          kind: 'neighbor',
          attn: 0.016711919335648417,
          fx: 92,
          fy: 318,
          series: [
            599,
            600,
            1183,
            814,
            1063,
            1054,
            816,
            671,
            601,
            547,
            470,
            547,
            590,
            620,
            549,
            539,
            470,
            460,
            693,
            644,
            538,
            498,
            551,
            479,
            466,
            552,
            616,
            541,
            498,
            506,
            560,
            631,
            1100,
            996,
            863,
            577,
            658,
            536,
            462,
            510,
            528,
            583,
            521,
            534,
            508,
            541,
            642,
            593,
            551,
            509,
            587,
            513,
            497,
            521,
            599,
            591,
            553,
            572,
            540,
            523,
            565,
            744,
            650,
            663,
            611,
            695,
            615,
            641,
            621,
            582,
            598,
            595,
            547,
            631,
            520,
            597,
            698,
            644,
            537,
            523,
            562,
            598,
            574,
            617,
            525,
            613,
            590,
            564,
            623,
            606,
            598,
            618,
            705,
            609,
            525,
            632,
            535,
            1919,
            1119,
            667,
            559,
            540,
            537,
            583,
            631,
            579,
            597,
            539,
            468,
            489,
            515,
            586,
            630,
            539,
            544,
            540,
            609,
            592,
            598,
            564,
            573,
            520,
            537,
            627,
            785,
            647,
            614,
            753,
            698,
            498,
            507,
            650,
            697,
            593,
            569,
            567,
            630,
            1331,
            2077,
            1019,
          ],
        },
        {
          id: 26466,
          title: 'Neoliberalism',
          kind: 'neighbor',
          attn: 0.04064391067783747,
          fx: 224,
          fy: 377,
          series: [
            4271,
            3790,
            3240,
            3102,
            2927,
            3599,
            4188,
            4321,
            3951,
            3431,
            2857,
            4019,
            5283,
            4802,
            4655,
            4205,
            3543,
            3470,
            3719,
            4925,
            5392,
            6365,
            6605,
            4313,
            3474,
            3497,
            4432,
            4295,
            4814,
            3570,
            2958,
            2762,
            3094,
            3193,
            3143,
            3923,
            3596,
            3011,
            3082,
            3129,
            3509,
            3713,
            3778,
            3732,
            3585,
            3145,
            3913,
            4252,
            4198,
            4376,
            4965,
            5043,
            4690,
            4736,
            4421,
            4597,
            5965,
            5463,
            4909,
            4288,
            4308,
            4989,
            5434,
            4746,
            4700,
            4302,
            4074,
            4288,
            4508,
            4342,
            4362,
            4190,
            3998,
            3431,
            3921,
            4159,
            4321,
            4257,
            4159,
            3932,
            3577,
            3747,
            4324,
            4224,
            4216,
            4291,
            3774,
            3461,
            3555,
            3909,
            3928,
            3858,
            4085,
            3689,
            3704,
            3643,
            4082,
            3912,
            3820,
            3591,
            3527,
            3134,
            3305,
            3757,
            3970,
            3667,
            3518,
            3312,
            3681,
            4040,
            4109,
            4502,
            4930,
            4239,
            4065,
            3559,
            3825,
            4163,
            4032,
            4228,
            3768,
            3568,
            3350,
            3533,
            4303,
            3800,
            3728,
            3513,
            3495,
            3174,
            3364,
            3719,
            3856,
            3901,
            3700,
            3637,
            3250,
            3378,
            3936,
            4104,
          ],
        },
        {
          id: 38229,
          title: 'Michel Houellebecq',
          kind: 'neighbor',
          attn: 0.021066951266090785,
          fx: 384,
          fy: 194,
          series: [
            529,
            518,
            484,
            455,
            565,
            624,
            528,
            563,
            564,
            531,
            590,
            628,
            643,
            587,
            820,
            741,
            615,
            584,
            643,
            645,
            579,
            554,
            647,
            589,
            517,
            556,
            523,
            484,
            463,
            437,
            467,
            507,
            525,
            456,
            494,
            1098,
            495,
            491,
            502,
            601,
            544,
            536,
            558,
            571,
            513,
            606,
            626,
            556,
            647,
            539,
            654,
            602,
            596,
            773,
            667,
            532,
            597,
            631,
            650,
            542,
            651,
            757,
            666,
            607,
            550,
            554,
            568,
            654,
            592,
            614,
            574,
            605,
            556,
            559,
            596,
            595,
            586,
            606,
            581,
            573,
            520,
            628,
            1506,
            2779,
            1795,
            1126,
            1091,
            910,
            1049,
            944,
            904,
            797,
            805,
            707,
            753,
            740,
            674,
            746,
            626,
            639,
            627,
            724,
            735,
            648,
            607,
            554,
            610,
            617,
            617,
            595,
            558,
            504,
            618,
            596,
            496,
            528,
            578,
            568,
            520,
            538,
            527,
            628,
            567,
            589,
            631,
            577,
            592,
            586,
            524,
            563,
            717,
            581,
            560,
            520,
            504,
            548,
            569,
            632,
            627,
            538,
          ],
        },
        {
          id: 37948,
          title: 'Black bloc',
          kind: 'neighbor',
          attn: 0.03216394981635468,
          fx: 516,
          fy: 456,
          series: [
            256,
            278,
            301,
            229,
            267,
            234,
            274,
            278,
            241,
            249,
            218,
            240,
            284,
            272,
            247,
            290,
            258,
            221,
            221,
            267,
            270,
            302,
            280,
            245,
            364,
            248,
            287,
            367,
            319,
            214,
            194,
            158,
            201,
            219,
            177,
            197,
            205,
            226,
            204,
            219,
            211,
            233,
            258,
            200,
            247,
            205,
            224,
            243,
            244,
            284,
            263,
            293,
            309,
            326,
            311,
            279,
            317,
            336,
            296,
            294,
            287,
            294,
            317,
            326,
            340,
            292,
            309,
            313,
            311,
            305,
            334,
            272,
            265,
            300,
            388,
            286,
            247,
            291,
            321,
            406,
            324,
            292,
            306,
            292,
            265,
            277,
            243,
            269,
            233,
            287,
            271,
            285,
            274,
            266,
            248,
            240,
            245,
            238,
            243,
            249,
            269,
            227,
            251,
            292,
            402,
            615,
            3997,
            11488,
            12339,
            28426,
            30065,
            19822,
            11550,
            7526,
            9754,
            6249,
            3617,
            2318,
            2064,
            2056,
            1696,
            2189,
            1495,
            1382,
            1164,
            1226,
            1291,
            1617,
            1176,
            958,
            1069,
            1017,
            794,
            775,
            651,
            580,
            634,
            536,
            541,
            543,
          ],
        },
        {
          id: 12061,
          title: 'Yellow',
          kind: 'neighbor',
          attn: 0.019883899749921902,
          fx: 249,
          fy: 278,
          series: [
            860,
            813,
            800,
            665,
            830,
            790,
            897,
            842,
            1012,
            773,
            801,
            742,
            875,
            890,
            820,
            830,
            905,
            738,
            787,
            885,
            836,
            819,
            762,
            651,
            697,
            746,
            789,
            854,
            785,
            740,
            687,
            666,
            638,
            661,
            705,
            701,
            786,
            722,
            719,
            705,
            705,
            794,
            739,
            741,
            693,
            671,
            728,
            792,
            756,
            824,
            837,
            1358,
            955,
            829,
            881,
            822,
            950,
            904,
            1222,
            843,
            832,
            963,
            880,
            836,
            853,
            844,
            799,
            815,
            800,
            934,
            896,
            883,
            900,
            825,
            827,
            902,
            951,
            958,
            767,
            781,
            750,
            804,
            725,
            819,
            880,
            765,
            730,
            690,
            612,
            746,
            844,
            791,
            691,
            761,
            663,
            742,
            678,
            673,
            651,
            689,
            655,
            651,
            675,
            604,
            669,
            636,
            698,
            637,
            554,
            630,
            690,
            682,
            635,
            670,
            651,
            605,
            639,
            621,
            762,
            647,
            648,
            648,
            647,
            677,
            644,
            786,
            660,
            670,
            595,
            763,
            686,
            802,
            698,
            667,
            622,
            702,
            671,
            632,
            645,
            613,
          ],
        },
      ],
      links: [
        {
          kind: 'neighbor',
          source: 720,
          target: 353191,
          weight: 576,
          attn: 0.0354412004484662,
        },
        {
          kind: 'neighbor',
          source: 349594,
          target: 353191,
          weight: 150,
          attn: 0.02799676757838045,
        },
        {
          kind: 'neighbor',
          source: 315904,
          target: 353191,
          weight: 548,
          attn: 0.022770619552050318,
        },
        {
          kind: 'neighbor',
          source: 326280,
          target: 353191,
          weight: 570,
          attn: 0.03140008707331227,
        },
        {
          kind: 'neighbor',
          source: 336053,
          target: 353191,
          weight: 187,
          attn: 0.016711919335648417,
        },
        {
          kind: 'neighbor',
          source: 26466,
          target: 353191,
          weight: 217,
          attn: 0.04064391067783747,
        },
        {
          kind: 'neighbor',
          source: 38229,
          target: 353191,
          weight: 258,
          attn: 0.021066951266090785,
        },
        {
          kind: 'neighbor',
          source: 37948,
          target: 353191,
          weight: 462,
          attn: 0.03216394981635468,
        },
        {
          kind: 'neighbor',
          source: 12061,
          target: 353191,
          weight: 567,
          attn: 0.019883899749921902,
        },
        {
          kind: 'neighbor',
          source: 12061,
          target: 315904,
          weight: 567,
        },
        {
          kind: 'neighbor',
          source: 38229,
          target: 315904,
          weight: 221,
        },
        {
          kind: 'neighbor',
          source: 336053,
          target: 315904,
          weight: 1322,
        },
        {
          kind: 'neighbor',
          source: 315904,
          target: 336053,
          weight: 1035,
        },
        {
          kind: 'neighbor',
          source: 336053,
          target: 26466,
          weight: 5,
        },
        {
          kind: 'neighbor',
          source: 336053,
          target: 12061,
          weight: 840,
        },
      ],
    };

    const attnColor = d3.scaleSequential(d3.interpolateBlues).domain([0, 0.05]);
    const edgeWidth = d3
      .scaleLinear()
      .domain([0, 0.04])
      .range([0, 4.5]);
    const nodeWidth = 90;
    const nodeHeight = 60;
    const layerHeight = 30;

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 30 },
      width = 1400 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

    d3.select(this.refs.canvas)
      .selectAll('svg')
      .remove();

    // append the svg object to the body of the page
    var svg = d3
      .select(this.refs.canvas)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    var g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg
      .append('defs')
      .selectAll('marker')
      .data(['end']) // Different link/path types can be defined here
      .enter()
      .append('marker') // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('fill', '#aaa');

    var link = g
      .selectAll('line3')
      .data(data.links)
      .enter()
      .append('line')
      .style('stroke', '#aaa')
      .attr('stroke-width', n => edgeWidth(n.attn))
      .attr('marker-end', n => {
        if (n.kind === 'neighbor') {
          return 'url(#end)';
        }
      });

    // Initialize the nodes
    var node = g
      .selectAll('rect2')
      .data(data.nodes)
      .enter()
      .append('rect')
      .attr('width', n => {
        if (n.kind === 'concat') {
          return 30;
        } else {
          return nodeWidth;
        }
      })
      .attr('height', n => {
        if (n.kind === 'neighbor' || n.kind == 'central') {
          return nodeHeight;
        } else if (n.kind === 'decomposition') {
          return layerHeight;
        } else if (n.kind === 'module') {
          return nodeWidth;
        } else if (n.kind === 'forecast') {
          return nodeHeight;
        } else if (n.kind === 'concat') {
          return 30;
        }
      })
      .attr('stroke', '#000')
      .attr('stroke-width', n => (n.kind === 'module' ? 1 : 1))
      .style('fill', n => {
        if (n.id === 'network') {
          return '#c6d9ec';
        } else if (n.id === 'model') {
          return '#ffdb99';
        }
        if (n.kind === 'concat') {
          return '#d4d4d4';
        } else {
          return 'white';
        }
      })
      .attr('rx', n => {
        if (n.kind === 'module') {
          return 20;
        }
        if (n.kind === 'concat') {
          return 100;
        } else {
          return 0;
        }
      })
      .attr('ry', n => {
        if (n.kind === 'module') {
          return 20;
        }
        if (n.kind === 'concat') {
          return 100;
        } else {
          return 0;
        }
      });

    // Let's list the force we wanna apply on the network
    var simulation = d3
      .forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
      .force(
        'link',
        d3
          .forceLink() // This force provides links between nodes
          .id(function(d) {
            return d.id;
          }) // This provide  the id of a node
          .distance(50)
          .strength(0.1)
          .links(data.links) // and this the list of links
      )
      .force('charge', d3.forceManyBody().strength(-1000)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force('center', d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
      .on('tick', ticked);
    // .start();

    node.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragging)
        .on('end', dragended)
    );

    var path1 = g
      .selectAll('path')
      .data(data.nodes)
      .enter()
      .append('path')
      .attr('fill', n => {
        if (n.kind == 'neighbor') {
          return '#c6d9ec';
        } else if (n.kind == 'central') {
          return '#ffdb99';
        } else if (n.kind == 'decomposition') {
          return 'orange';
        } else if (n.kind == 'forecast') {
          return 'orange';
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .attr('stroke', 'black');

    var path2 = g
      .selectAll('path2')
      .data(data.nodes)
      .enter()
      .append('path')
      .attr('fill', n => {
        if (n.kind == 'neighbor') {
          return '#6699cc';
        } else if (n.kind == 'central') {
          return 'orange';
        }
      })
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .attr('stroke', 'black');

    const text = g
      .selectAll('.label')
      .data(data.nodes)
      .enter()
      .append('text')
      .text(d => d.title)
      .style('text-anchor', 'middle')
      .style('fill', '#555')
      .style('font-family', 'Helvetica')
      .style('font-size', n => {
        if (n.kind == 'concat') {
          return 40;
        } else if (n.kind == 'decomposition') {
          return 10;
        } else {
          return 14;
        }
      });

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
      link
        .attr('x1', function(d) {
          return d.source.x + nodeWidth / 2;
        })
        .attr('y1', function(d) {
          return d.source.y + nodeHeight / 2;
        })
        .attr('x2', function(d) {
          let halfHeight = nodeHeight / 2;
          var inter = pointOnRect(
            d.source.x,
            d.source.y,
            d.target.x - nodeWidth / 2,
            d.target.y - halfHeight,
            d.target.x + nodeWidth / 2,
            d.target.y + halfHeight
          );
          return inter.x + nodeWidth / 2;
        })
        .attr('y2', function(d) {
          let halfHeight = nodeHeight / 2;
          var inter = pointOnRect(
            d.source.x,
            d.source.y,
            d.target.x - nodeWidth / 2,
            d.target.y - halfHeight,
            d.target.x + nodeWidth / 2,
            d.target.y + halfHeight
          );
          return inter.y + halfHeight;
        });

      node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      path1.attr('d', function(n, i) {
        if (n.kind == 'module' || n.kind == 'concat') {
          return;
        }
        let xDomain = [0, 140];
        let xRange = [n.x, n.x + nodeWidth];
        let yDomain = [0, d3.max(n.series) * 1.05];
        let height = nodeHeight;
        let yRange = [n.y + height, n.y];
        let series = n.series.slice(0, -28);
        if (n.kind === 'decomposition') {
          xDomain = [0, 28];
          yDomain = [d3.min(n.series), d3.max(n.series) * 1.05];
          height = layerHeight;
          yRange = [n.y + height, n.y];
          series = n.series;
        } else if (n.kind === 'forecast') {
          xDomain = [0, 28];
          xRange = [n.x + nodeWidth - 28, n.x + nodeWidth];
          yDomain = [d3.min(n.series), d3.max(n.series) * 1.05];
          height = nodeHeight;
          yRange = [n.y + height, n.y];
          series = n.series;
        }

        var x = d3
          .scaleLinear()
          .domain(xDomain)
          .range(xRange);
        var y = d3
          .scaleLinear()
          .domain(yDomain)
          .range(yRange);
        return d3
          .area()
          .x(function(d, pos) {
            return x(pos);
          })
          .y1(function(d) {
            return y(d);
          })
          .y0(n.y + height)(series);
      });

      path2.attr('d', function(n, i) {
        if (
          n.kind == 'module' ||
          n.kind == 'concat' ||
          n.kind == 'decomposition' ||
          n.kind == 'forecast'
        ) {
          return;
        }
        let xDomain = [0, 140];
        let xRange = [n.x, n.x + nodeWidth];
        let yDomain = [0, d3.max(n.series) * 1.05];
        let height = nodeHeight;
        let yRange = [n.y + height, n.y];
        let series = n.series.slice(-29);

        var x = d3
          .scaleLinear()
          .domain(xDomain)
          .range(xRange);
        var y = d3
          .scaleLinear()
          .domain(yDomain)
          .range(yRange);
        return d3
          .area()
          .x(function(d, pos) {
            return x(pos + 111);
          })
          .y1(function(d) {
            return y(d);
          })
          .y0(n.y + height)(series);
      });

      text
        .attr('x', d => {
          if (d.kind == 'concat') {
            return d.x + 15;
          }

          return d.x + nodeWidth / 2;
        })
        .attr('y', d => {
          if (d.kind == 'module') {
            return d.y + nodeWidth / 2 - 5;
          }
          if (d.kind == 'concat') {
            return d.y + 26;
          } else if (d.kind == 'decomposition') {
            return d.y + 10;
          } else {
            return d.y - 10;
          }
        });
    }

    g.append('rect')
      .attr('x', 1090)
      .attr('y', 440)
      .attr('width', 110)
      .attr('height', 80)
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .style('stroke-dasharray', '5,5')
      .style('fill', 'none');

    svg
      .append('line')
      .style('stroke', '#aaa')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#end)')
      .attr('x1', 1125)
      .attr('y1', 460)
      .attr('x2', 1150)
      .attr('y2', 460);

    svg
      .append('line')
      .style('stroke', '#aaa')
      .attr('stroke-width', 3)
      .attr('marker-end', 'url(#end)')
      .attr('x1', 1125)
      .attr('y1', 477)
      .attr('x2', 1150)
      .attr('y2', 477);

    svg
      .append('circle')
      .attr('cx', 1130)
      .attr('cy', 500)
      .attr('r', 6)
      .style('fill', '#c6d9ec');
    svg
      .append('circle')
      .attr('cx', 1145)
      .attr('cy', 500)
      .attr('r', 6)
      .style('fill', '#ffdb99');

    svg
      .append('circle')
      .attr('cx', 1130)
      .attr('cy', 520)
      .attr('r', 6)
      .style('fill', '#6699cc');
    svg
      .append('circle')
      .attr('cx', 1145)
      .attr('cy', 520)
      .attr('r', 6)
      .style('fill', 'orange');

    svg
      .append('text')
      .attr('x', 1155)
      .attr('y', 461)
      .text('less attention')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 1155)
      .attr('y', 478)
      .text('more attention')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');

    svg
      .append('text')
      .attr('x', 1155)
      .attr('y', 500)
      .text('backcast period')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');
    svg
      .append('text')
      .attr('x', 1155)
      .attr('y', 520)
      .text('forecast period')
      .style('fill', '#555')
      .style('font-size', 10)
      .style('font-family', 'Helvetica')
      .attr('alignment-baseline', 'middle');

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragging(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
    }

    /**
     * Finds the intersection point between
     *     * the rectangle
     *       with parallel sides to the x and y axes
     *     * the half-line pointing towards (x,y)
     *       originating from the middle of the rectangle
     *
     * Note: the function works given min[XY] <= max[XY],
     *       even though minY may not be the "top" of the rectangle
     *       because the coordinate system is flipped.
     *
     * @param (x,y):Number point to build the line segment from
     * @param minX:Number the "left" side of the rectangle
     * @param minY:Number the "top" side of the rectangle
     * @param maxX:Number the "right" side of the rectangle
     * @param maxY:Number the "bottom" side of the rectangle
     * @param check:boolean (optional) whether to treat point inside the rect as error
     * @return an object with x and y members for the intersection
     * @throws if check == true and (x,y) is inside the rectangle
     * @author TWiStErRob
     * @see <a href="https://stackoverflow.com/a/31254199/253468">source</a>
     * @see <a href="https://stackoverflow.com/a/18292964/253468">based on</a>
     */
    function pointOnRect(x, y, minX, minY, maxX, maxY, check) {
      //assert minX <= maxX;
      //assert minY <= maxY;
      if (check && minX <= x && x <= maxX && minY <= y && y <= maxY)
        throw 'Point ' +
          [x, y] +
          'cannot be inside ' +
          'the rectangle: ' +
          [minX, minY] +
          ' - ' +
          [maxX, maxY] +
          '.';
      var midX = (minX + maxX) / 2;
      var midY = (minY + maxY) / 2;
      // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
      var m = (midY - y) / (midX - x);

      if (x <= midX) {
        // check "left" side
        var minXy = m * (minX - x) + y;
        if (minY <= minXy && minXy <= maxY)
          return {
            x: minX,
            y: minXy,
          };
      }

      if (x >= midX) {
        // check "right" side
        var maxXy = m * (maxX - x) + y;
        if (minY <= maxXy && maxXy <= maxY)
          return {
            x: maxX,
            y: maxXy,
          };
      }

      if (y <= midY) {
        // check "top" side
        var minYx = (minY - y) / m + x;
        if (minX <= minYx && minYx <= maxX)
          return {
            x: minYx,
            y: minY,
          };
      }

      if (y >= midY) {
        // check "bottom" side
        var maxYx = (maxY - y) / m + x;
        if (minX <= maxYx && maxYx <= maxX)
          return {
            x: maxYx,
            y: maxY,
          };
      }

      // Should never happen :) If it does, please tell me!
      throw 'Cannot find intersection for ' +
        [x, y] +
        ' inside rectangle ' +
        [minX, minY] +
        ' - ' +
        [maxX, maxY] +
        '.';
    }
  }

  render() {
    if (this.state.clickedOnSong === true) {
      console.log('redirecting');
      console.log(this.state);
      return (
        <Redirect
          push
          to={`/overview/${this.props.egoType == 'A' ? 'artist' : 'video'}/${
            this.state.clickedVideoID
          }`}
        />
      );
    }
    return <div ref="canvas" />;
  }
}

export default WikiFlow;
