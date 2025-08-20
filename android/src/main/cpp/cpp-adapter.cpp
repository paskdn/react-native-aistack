#include <jni.h>
#include "aistackOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::aistack::initialize(vm);
}
