// import * as React from "react"
// import Svg, { Path } from "react-native-svg"

// function UserActive(props) {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       width={25}
//       height={24}
//       viewBox="0 0 25 24"
//       fill="none"
//       {...props}
//     >
//       <Path
//         d="M16.84 22H7.56a3.39 3.39 0 01-3.18-4.15l.24-1.14A3.29 3.29 0 017.79 14h8.82a3.29 3.29 0 013.17 2.71l.24 1.14A3.39 3.39 0 0116.84 22zM12.7 12h-1a4 4 0 01-4-4V5.36A3.35 3.35 0 0111.06 2h2.28a3.35 3.35 0 013.36 3.36V8a4 4 0 01-4 4z"
//         fill="#065E2C"
//       />
//     </Svg>
//   )
// }

// export default UserActive
import * as React from "react";
import { Svg, Path } from "react-native-svg";

function ProfileSvg({ color = "#525252", ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill={color}
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
      />
    </Svg>
  );
}

export default ProfileSvg;