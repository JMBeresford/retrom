/**
 * Shader configuration format:
 *
 * Default format, shader code in string:
 * "shader_name": "...",
 *
 * Advanced format, shader code in multiple files:
 * "shader_name": {
 *    //main shader file
 *    "shader": {
 *      "type": "text|base64",  //value type, "text" - plain text, "base64" - encoded with Base64
 *      "value": "...",         //main shader file value
 *    },
 *    //additional resources
 *    "resources": [
 *        {
 *            "name": "resource_file_name", //file name of resource. Note: all files will be placed in the same directory
 *            "type": "text|base64",        //resource value type, see "type" of main shader file
 *            "value": "...",               //resource file value
 *        },
 *        ...
 *    ],
 *  }
 */
export declare const EJS_SHADERS: {
  "2xScaleHQ.glslp": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "4xScaleHQ.glslp": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  sabr: {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-aperture.glslp": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-easymode.glslp": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-geom.glslp": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-mattias.glslp": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-beam": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-caligari": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-lottes": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-zfast": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "crt-yeetron": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  bicubic: {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
  "mix-frames": {
    shader: {
      type: string;
      value: string;
    };
    resources: {
      name: string;
      type: string;
      value: string;
    }[];
  };
};

declare global {
  export interface Window {
    EJS_SHADERS?: typeof EJS_SHADERS;
  }
}
