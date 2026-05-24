import { CONFIG } from 'src/global-config';
import { DefaultKeySettings } from 'src/sections/defaultSettingKey/view';
// ----------------------------------------------------------------------

const metadata = { title: `Dữ liệu mặc định - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title} </title>
      <DefaultKeySettings />
    </>
  );
}
