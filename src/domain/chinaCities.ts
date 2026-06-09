export type ChinaCity = {
  province: string;
  city: string;
  longitude: number;
  latitude: number;
  precision: "prefecture-center";
};

export const CHINA_CITIES: ChinaCity[] = [
  { province: "北京市", city: "北京市", longitude: 116.4074, latitude: 39.9042, precision: "prefecture-center" },
  { province: "天津市", city: "天津市", longitude: 117.2000, latitude: 39.1333, precision: "prefecture-center" },
  { province: "上海市", city: "上海市", longitude: 121.4737, latitude: 31.2304, precision: "prefecture-center" },
  { province: "重庆市", city: "重庆市", longitude: 106.5516, latitude: 29.5630, precision: "prefecture-center" },
  { province: "河北省", city: "石家庄市", longitude: 114.5149, latitude: 38.0428, precision: "prefecture-center" },
  { province: "河北省", city: "唐山市", longitude: 118.1802, latitude: 39.6309, precision: "prefecture-center" },
  { province: "河北省", city: "秦皇岛市", longitude: 119.6005, latitude: 39.9354, precision: "prefecture-center" },
  { province: "河北省", city: "邯郸市", longitude: 114.5391, latitude: 36.6256, precision: "prefecture-center" },
  { province: "河北省", city: "保定市", longitude: 115.4646, latitude: 38.8744, precision: "prefecture-center" },
  { province: "河北省", city: "张家口市", longitude: 114.8859, latitude: 40.7689, precision: "prefecture-center" },
  { province: "河北省", city: "承德市", longitude: 117.9624, latitude: 40.9541, precision: "prefecture-center" },
  { province: "山西省", city: "太原市", longitude: 112.5489, latitude: 37.8706, precision: "prefecture-center" },
  { province: "山西省", city: "大同市", longitude: 113.3001, latitude: 40.0768, precision: "prefecture-center" },
  { province: "山西省", city: "临汾市", longitude: 111.5190, latitude: 36.0880, precision: "prefecture-center" },
  { province: "内蒙古自治区", city: "呼和浩特市", longitude: 111.7492, latitude: 40.8426, precision: "prefecture-center" },
  { province: "内蒙古自治区", city: "包头市", longitude: 109.8403, latitude: 40.6574, precision: "prefecture-center" },
  { province: "内蒙古自治区", city: "鄂尔多斯市", longitude: 109.7813, latitude: 39.6083, precision: "prefecture-center" },
  { province: "辽宁省", city: "沈阳市", longitude: 123.4315, latitude: 41.8057, precision: "prefecture-center" },
  { province: "辽宁省", city: "大连市", longitude: 121.6147, latitude: 38.9140, precision: "prefecture-center" },
  { province: "辽宁省", city: "鞍山市", longitude: 122.9946, latitude: 41.1085, precision: "prefecture-center" },
  { province: "吉林省", city: "长春市", longitude: 125.3235, latitude: 43.8171, precision: "prefecture-center" },
  { province: "吉林省", city: "吉林市", longitude: 126.5494, latitude: 43.8378, precision: "prefecture-center" },
  { province: "黑龙江省", city: "哈尔滨市", longitude: 126.5349, latitude: 45.8038, precision: "prefecture-center" },
  { province: "黑龙江省", city: "齐齐哈尔市", longitude: 123.9579, latitude: 47.3421, precision: "prefecture-center" },
  { province: "江苏省", city: "南京市", longitude: 118.7969, latitude: 32.0603, precision: "prefecture-center" },
  { province: "江苏省", city: "无锡市", longitude: 120.3119, latitude: 31.4912, precision: "prefecture-center" },
  { province: "江苏省", city: "徐州市", longitude: 117.2841, latitude: 34.2058, precision: "prefecture-center" },
  { province: "江苏省", city: "常州市", longitude: 119.9741, latitude: 31.8112, precision: "prefecture-center" },
  { province: "江苏省", city: "苏州市", longitude: 120.5853, latitude: 31.2989, precision: "prefecture-center" },
  { province: "浙江省", city: "杭州市", longitude: 120.1551, latitude: 30.2741, precision: "prefecture-center" },
  { province: "浙江省", city: "宁波市", longitude: 121.5504, latitude: 29.8746, precision: "prefecture-center" },
  { province: "浙江省", city: "温州市", longitude: 120.6994, latitude: 27.9949, precision: "prefecture-center" },
  { province: "浙江省", city: "金华市", longitude: 119.6474, latitude: 29.0792, precision: "prefecture-center" },
  { province: "安徽省", city: "合肥市", longitude: 117.2272, latitude: 31.8206, precision: "prefecture-center" },
  { province: "安徽省", city: "芜湖市", longitude: 118.4331, latitude: 31.3525, precision: "prefecture-center" },
  { province: "福建省", city: "福州市", longitude: 119.2965, latitude: 26.0745, precision: "prefecture-center" },
  { province: "福建省", city: "厦门市", longitude: 118.0894, latitude: 24.4798, precision: "prefecture-center" },
  { province: "福建省", city: "泉州市", longitude: 118.6759, latitude: 24.8741, precision: "prefecture-center" },
  { province: "江西省", city: "南昌市", longitude: 115.8582, latitude: 28.6829, precision: "prefecture-center" },
  { province: "江西省", city: "赣州市", longitude: 114.9348, latitude: 25.8311, precision: "prefecture-center" },
  { province: "山东省", city: "济南市", longitude: 117.1201, latitude: 36.6512, precision: "prefecture-center" },
  { province: "山东省", city: "青岛市", longitude: 120.3826, latitude: 36.0671, precision: "prefecture-center" },
  { province: "山东省", city: "烟台市", longitude: 121.4479, latitude: 37.4638, precision: "prefecture-center" },
  { province: "山东省", city: "潍坊市", longitude: 119.1618, latitude: 36.7069, precision: "prefecture-center" },
  { province: "河南省", city: "郑州市", longitude: 113.6254, latitude: 34.7466, precision: "prefecture-center" },
  { province: "河南省", city: "洛阳市", longitude: 112.4540, latitude: 34.6197, precision: "prefecture-center" },
  { province: "河南省", city: "南阳市", longitude: 112.5283, latitude: 32.9908, precision: "prefecture-center" },
  { province: "湖北省", city: "武汉市", longitude: 114.3054, latitude: 30.5931, precision: "prefecture-center" },
  { province: "湖北省", city: "宜昌市", longitude: 111.2865, latitude: 30.6919, precision: "prefecture-center" },
  { province: "湖南省", city: "长沙市", longitude: 112.9388, latitude: 28.2282, precision: "prefecture-center" },
  { province: "湖南省", city: "株洲市", longitude: 113.1340, latitude: 27.8274, precision: "prefecture-center" },
  { province: "湖南省", city: "衡阳市", longitude: 112.5719, latitude: 26.8932, precision: "prefecture-center" },
  { province: "广东省", city: "广州市", longitude: 113.2644, latitude: 23.1291, precision: "prefecture-center" },
  { province: "广东省", city: "深圳市", longitude: 114.0579, latitude: 22.5431, precision: "prefecture-center" },
  { province: "广东省", city: "珠海市", longitude: 113.5767, latitude: 22.2707, precision: "prefecture-center" },
  { province: "广东省", city: "佛山市", longitude: 113.1214, latitude: 23.0215, precision: "prefecture-center" },
  { province: "广东省", city: "东莞市", longitude: 113.7518, latitude: 23.0207, precision: "prefecture-center" },
  { province: "广西壮族自治区", city: "南宁市", longitude: 108.3669, latitude: 22.8170, precision: "prefecture-center" },
  { province: "广西壮族自治区", city: "桂林市", longitude: 110.2900, latitude: 25.2736, precision: "prefecture-center" },
  { province: "海南省", city: "海口市", longitude: 110.1983, latitude: 20.0440, precision: "prefecture-center" },
  { province: "海南省", city: "三亚市", longitude: 109.5119, latitude: 18.2528, precision: "prefecture-center" },
  { province: "四川省", city: "成都市", longitude: 104.0665, latitude: 30.5728, precision: "prefecture-center" },
  { province: "四川省", city: "绵阳市", longitude: 104.6791, latitude: 31.4675, precision: "prefecture-center" },
  { province: "四川省", city: "乐山市", longitude: 103.7654, latitude: 29.5521, precision: "prefecture-center" },
  { province: "贵州省", city: "贵阳市", longitude: 106.6302, latitude: 26.6470, precision: "prefecture-center" },
  { province: "云南省", city: "昆明市", longitude: 102.8329, latitude: 24.8801, precision: "prefecture-center" },
  { province: "云南省", city: "大理白族自治州", longitude: 100.2676, latitude: 25.6065, precision: "prefecture-center" },
  { province: "西藏自治区", city: "拉萨市", longitude: 91.1322, latitude: 29.6604, precision: "prefecture-center" },
  { province: "陕西省", city: "西安市", longitude: 108.9402, latitude: 34.3416, precision: "prefecture-center" },
  { province: "陕西省", city: "咸阳市", longitude: 108.7088, latitude: 34.3299, precision: "prefecture-center" },
  { province: "甘肃省", city: "兰州市", longitude: 103.8343, latitude: 36.0611, precision: "prefecture-center" },
  { province: "青海省", city: "西宁市", longitude: 101.7782, latitude: 36.6171, precision: "prefecture-center" },
  { province: "宁夏回族自治区", city: "银川市", longitude: 106.2309, latitude: 38.4872, precision: "prefecture-center" },
  { province: "新疆维吾尔自治区", city: "乌鲁木齐市", longitude: 87.6168, latitude: 43.8256, precision: "prefecture-center" },
  { province: "新疆维吾尔自治区", city: "喀什地区", longitude: 75.9898, latitude: 39.4704, precision: "prefecture-center" },
  { province: "香港特别行政区", city: "香港特别行政区", longitude: 114.1694, latitude: 22.3193, precision: "prefecture-center" },
  { province: "澳门特别行政区", city: "澳门特别行政区", longitude: 113.5439, latitude: 22.1987, precision: "prefecture-center" }
];

export function getChinaProvinces(): string[] {
  return [...new Set(CHINA_CITIES.map((city) => city.province))];
}

export function getCitiesByProvince(province: string): ChinaCity[] {
  return CHINA_CITIES.filter((city) => city.province === province);
}

export function findChinaCity(params: { province?: string; city?: string }): ChinaCity | undefined {
  return CHINA_CITIES.find((entry) => {
    const provinceMatches = params.province ? entry.province === params.province : true;
    const cityMatches = params.city ? entry.city === params.city : true;
    return provinceMatches && cityMatches;
  });
}
